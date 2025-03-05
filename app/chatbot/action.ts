"use server";

import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI();
// const str = "I have been working as a marketing executive at a mid-sized company in Singapore for the past two years. Recently, I received a termination letter from my employer, stating that my employment would end in one month. The letter did not provide any reasons for the termination. I am unsure whether this termination is lawful and if I am entitled to any compensation or recourse.";

const tools: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "legal_advice",
      description:
        "Get detailed information about Singapore law to help answer the user query accurately",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "The user's query that is formatted with no broken english but do not summarise or change the meaning of the user's query",
          },
        },
        required: ["query"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
];

async function legal_advice(query: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a legal assistant for Singapore Law. 
        Analyze the user's query and provide a document of relevant sections from Singapore Acts and Statutues that will give insights for his conerns.
        You do not have to explain your document, just provide them in a concise format`,
      },
      {
        role: "user",
        content: query,
      },
    ],
    temperature: 0,
  });
  console.log(completion.choices[0]?.message?.content)
  const supabase = await createClient();
  openai.embeddings
          .create({
            model: "text-embedding-3-small",
            input: completion.choices[0]?.message?.content as string,
            encoding_format: "float",
          })
          .then((completion2) => {
            const embeddingVector = completion2.data[0].embedding;
            supabase
              .rpc("match_documents", {
                query_embedding: embeddingVector,
                match_threshold: 0.5,
                match_count: 10,
              })
              // supabase
              // .rpc("hybrid_search", {
              //   query_text: query,
              //   query_embedding: embeddingVector,
              //   match_count: 10,
              // })
              .then(({ data, error }) => {
                if (error) {
                  throw error;
                }
                console.log(data)
                if (data.length !== 0){
                  const rerank_prompt = `These are some documents retrieved from various Singapore Law Acts and Statutes. Evaluate them and find out the most relevant and helpful documents to answer the user query. You can respond with either one or multiple documents depending on how relevant and helpful they are to the user query but strictly no returning duplicate of documents.\n\nThe user's query: ${query}\n\n`;

                  const documents = (data as DocumentType[])
                    .map(
                      (x) =>
                        `Act: ${x.act ?? ""} | Part section: ${x.part_id ?? ""} | Part title: ${x.part_title ?? ""} | Section title: ${x.title ?? ""} | Section content: ${x.content ?? ""}\n\n`
                    )
                    .join("");
                    console.log('document documentdocumentdocumentdocumentdocumentdocumentdocumentdocumentdocumentdocumentdocumentdocument')
                    console.log(documents)
                    openai.beta.chat.completions
                    .parse({
                      model: "gpt-4o-mini",
                      messages: [
                        {
                          role: "system",
                          content: `You are a legal assistant for Singapore Law.`,
                        },
                        {
                          role: "user",
                          content: rerank_prompt + documents,
                        },
                      ],
                      response_format: zodResponseFormat(DocumentsSchema, "documents"),
                      temperature: 0,
                    })
                    .then((response) => {
                      const obj = response.choices[0].message.parsed;
                      console.log("==================================================");
                      let resultStr = '';
  
                      for (const x of obj!.documents_l) {
                        for (const key in x) {
                          if (Object.prototype.hasOwnProperty.call(x, key)) {
                            resultStr += `${key}: ${x[key]} | `;
                          }
                        }
                        resultStr += '\n\n';
                      }
                      console.log("Response content:", resultStr);
                      openai.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                          {
                            role: "system",
                            content: `You are a legal assistant for Singapore Law.
                            Here are some documents retrieved from various Singapore Acts to help you answer the user query.\n\n
                            ${resultStr}
                            `,
                          },
                          {
                            role: "user",
                            content: `${query}`,
                          },
                        ],
                        temperature: 0,
                      }).then((response) => {
                          console.log(response.choices[0].message.content) // 1. FINAL OUTPUT FROM LLM!!!!
                      })
                    })
                    .catch((error) => {
                      console.error("Error:", error);
                    });
                }else {
                  console.log('Empty data: ', data)
                  console.log('Sorry, optimus is not smart enough to help with your request') // 2. FALL BACK OUTPUT FROM LLM!!!
                }
                
              });

          })
          .catch((error) => {
            console.error("Error creating embedding:", error);
          });
  // console.log("tool called", completion.choices[0]?.message?.content);
  return 'test'
}
interface Message {
  id: number;
  created_at: string;
  role: "user" | "bot";
  messages: string;
}

const DocumentSchema = z.object({
  act: z.string(),
  part_id: z.string(),
  part_title: z.string(),
  title: z.string(),
  content: z.string(),
});

type DocumentType = z.infer<typeof DocumentSchema>;

const DocumentsSchema = z.object({
  documents_l: z.array(DocumentSchema),
});

// export default async function saveMessage(prevState: { error: string } | undefined, formData: FormData)
//     : Promise<{ error: string } | undefined> {
//     console.log('test')
//     const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,
//         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,)
//     const messages = formData?.get('message')
//     if (!messages) {
//         return
//     }
//     const { error } = await supabase
//         .from('Message')
//         .insert({ messages, role: 'user' })

//     if (error) {
//         console.log(error)
//         return {
//             error: 'Server is busy'
//         }
//     }
// }

export default async function saveMessage(
  messages: string
): Promise<{ error: string } | undefined> {
  console.log("test");

  if (!messages) {
    return;
  }
  const supabase = await createClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
          You are a legal assistant for Singapore Law. You have access to the following tool but only allowed to use each tool once:
          - 'legal_advice': This tool is used to provide legal advice and summaries of Singapore laws. Use this tool when the user asks a legal question related to Singapore.

          For any other general user queries that are irrelevant to Singapore law or lawyer context or greetings, respond with: "Hi how may i help you."
          `,
      },
      { role: "user", content: messages },
    ],
    temperature: 0,
    tools,
    tool_choice: "auto",
  });
  // console.log("aaaaaaaaaaaaaaaaa", completion.choices[0].message.tool_calls);
  if (completion.choices[0].message.tool_calls){
    for (const toolCall of completion.choices[0].message.tool_calls) {
      // const name = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);
  
      legal_advice(args.query)
        .then((result) => {
          console.log(result)
        })
        .catch((error) => {
          console.error("Error with legal advice:", error);
        });
  
      // messages.push({
      //     role: "tool",
      //     tool_call_id: toolCall.id,
      //     content: result.toString()
      // });
    }
  }else{
    console.log(completion.choices[0].message.content) // 3. FALLBACK OUTPUT FROM LLM !!!!!
  }

  // for await (const part of stream) {
  //   process.stdout.write(part.choices[0]?.delta?.content || '');
  // }
  // process.stdout.write('\n');

  const { error } = await supabase
    .from("Message")
    .insert({ messages, role: "user" });

  if (error) {
    console.log(error);
    return {
      error: "Server is busy",
    };
  }
}
