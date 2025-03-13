'use server';
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import {
  OPENAI_EMBEDDING_MODEL,
  OPENAI_CHAT_COMPLETIONS_MODEL,
} from "@/utils/openai";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";

const openai = new OpenAI();

const ResponseSchema = z.object({
    keyword: z.string(),
    paragraph: z.string(),
    title: z.string().nullable()
});

export async function search(formData: FormData){
  const supabase = await createClient();
  if (!formData.get('query') || String(formData!.get('query')!).trim() === '') {
    return redirect('/search');
  }

  redirect(`/search?query=${encodeURIComponent(String(formData!.get('query')!))}&page=1`);
}

export const performSearch = cache(async (
  query: string,
  page: number = 1,
  pageSize: number = 10
) => {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const response = await openai.beta.chat.completions.parse({
    model: OPENAI_CHAT_COMPLETIONS_MODEL,
    messages: [
        {
          role: "system",
          content: `You are a legal assistant for Singapore Case Laws and Judgments working for a search engine.
          Users will have queries to search for relevant or similar case laws and judgments to their query.
          Your main focus is to parse the user's query to have a more accurate match with our database of judgments
          
          Examples of title of case judgments are: UBQ v UBR, Masri Bin Hussain v PUBLIC PROSECUTOR, 
          J. G. JEWELRY PTE. LTD. v SHREE RAMKRISHNA EXPORTS PVT. LTD. & 7 Ors, TERRAFORM LABS PTE. LTD.,
          WXD v WXC, PANNIR SELVAM PRANTHAMAN v ATTORNEY-GENERAL OF SINGAPORE, Dr Ang Yong Guan v Singapore Medical Council
          `
      },
      {
          role: "user",
          content: `You have three tasks
          1. Generate keywords for a text search of the user's query.
          2. Generate a paragraph of a hypothetical summary of case law of the user's query. Be as general or broad as possible.
          3. Generate any title of cases or judgments that is mentioned in the user's query. If no title, return null.
          The user's query: ${query as string}`
        }
    ],
    response_format: zodResponseFormat(ResponseSchema, "search_response"),
    temperature: 0
  })
  const obj = response.choices[0].message.parsed
  console.log(obj)
  const embeddingResponse = await openai.embeddings.create({
      model: OPENAI_EMBEDDING_MODEL,
      input: obj!.paragraph,
      //input: query,
      encoding_format: 'float'
  })

  const embeddingVector = embeddingResponse.data[0].embedding;

  const { data, error, count } = await supabase.rpc("hybrid_search_judgments", {
    query_text: obj!.paragraph,
    query_embedding: embeddingVector,
    full_text_weight: 1.3,
    semantic_weight: 1.0,
    min_threshold: 0.01,
  });
  
  const paginatedData = data ? data.slice(from, to) : [];
  return {
    data: paginatedData,
    totalCount: count || data?.length || 0,
    page,
    pageSize
  };
});