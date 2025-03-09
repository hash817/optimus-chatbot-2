"use server";

import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {
    generateDocument,
    generateRerankPrompt,
    OPENAI_CHAT_COMPLETIONS_SYSTEM_MESSAGES_CONTENT,
    OPENAI_CHAT_COMPLETIONS_MODEL, OPENAI_CHAT_COMPLETIONS_TEMPERATURE,
    OPENAI_EMBEDDING_ENCODING_FORMAT, OPENAI_EMBEDDING_MODEL,
    SUPABASE_RPC_MATCH_COUNT,
    SUPABASE_RPC_MATCH_THRESHOLD,
    OPENAI_BETA_CHAT_COMPLETION_PARSE_SYSTEM_MESSAGE_CONTENT,
    DocumentType,
    OPENAI_BETA_CHAT_COMPLETION_PARSE_TEMPERATURE,
    generateFinalResponseSystemMessageContent,
    OPENAI_FINAL_RESPONSE_CHAT_COMPLETION_TEMPERATURE,
    DocumentsSchema,
    SAVE_MESSAGE_OPENAI_CHAT_COMPLETIONS_SYSTEM_MESSAGES_CONTENT,
    TOOLS,
    SAVE_MESSAGE_OPENAI_CHAT_COMPLETIONS_TEMPERATURE
} from "@/utils/openai";

const openai = new OpenAI();

export async function botAnswer(messages: string, chatId: number)
    : Promise<{ success: boolean; message: string }> {

    try {
        const completion = await openai.chat.completions.create({
            model: OPENAI_CHAT_COMPLETIONS_MODEL,
            messages: [
                {
                    role: "system",
                    content: SAVE_MESSAGE_OPENAI_CHAT_COMPLETIONS_SYSTEM_MESSAGES_CONTENT,
                },
                { role: "user", content: messages },
            ],
            temperature: SAVE_MESSAGE_OPENAI_CHAT_COMPLETIONS_TEMPERATURE,
            tools: TOOLS,
            tool_choice: "auto"
        });
        if (completion.choices[0].message.tool_calls) {
            for (const toolCall of completion.choices[0].message.tool_calls) {
                const args = JSON.parse(toolCall.function.arguments);
                try {
                    const legalAdviceResponse = await legal_advice(args.query)
                    const saveBotMessage = await saveMessage(legalAdviceResponse, chatId, "bot")
                    return saveBotMessage
                } catch (error) {
                    // console.log("Error with legal advice", error)
                    return {
                        success: false,
                        message: 'Server error. Please try again later'
                    }
                }
            }
        } else {
            // console.log('not use legal advice', completion.choices[0].message.content)
            return await saveMessage(completion.choices[0].message.content, chatId, "bot")
        }
    } catch (error) {
        console.log('api key wrong')
        return {
            success: false,
            message: 'Server error. Please try again later'
        }
    }

}

export async function saveMessage(messages: string, chatId: number, role: string)
    : Promise<{ success: boolean; message: string }> {
    const supabase = await createClient();
    const { error } = await supabase
        .from("Message")
        .insert({ messages, role, chat: chatId });

    if (error) {
        console.log(error);
        return {
            success: false,
            message: 'Server error. Please try again later'
        }
    }

    return {
        success: true,
        message: 'Message insert successfully'
    }
}

async function legal_advice(query: string): Promise<string> {
    const completion = await openai.chat.completions.create({
        model: OPENAI_CHAT_COMPLETIONS_MODEL,
        messages: [
            {
                role: "system",
                content: OPENAI_CHAT_COMPLETIONS_SYSTEM_MESSAGES_CONTENT
            },
            {
                role: "user",
                content: query
            }
        ],
        temperature: OPENAI_CHAT_COMPLETIONS_TEMPERATURE
    })

    const supabase = await createClient();

    try {
        const embeddingResponse = await openai.embeddings.create({
            model: OPENAI_EMBEDDING_MODEL,
            input: completion.choices[0]?.message?.content as string,
            encoding_format: OPENAI_EMBEDDING_ENCODING_FORMAT
        })

        const embeddingVector = embeddingResponse.data[0].embedding;

        const { data, error } = await supabase.rpc("match_documents", {
            query_embedding: embeddingVector,
            match_threshold: SUPABASE_RPC_MATCH_THRESHOLD,
            match_count: SUPABASE_RPC_MATCH_COUNT
        });

        if (error) throw error;

        if (data.length !== 0) {
            const rerank_prompt = generateRerankPrompt(query)
            const documents = (data as DocumentType[])
                .map(
                    (x: DocumentType) => generateDocument(x)
                )
                .join("");

            const response = await openai.beta.chat.completions.parse({
                model: OPENAI_CHAT_COMPLETIONS_MODEL,
                messages: [
                    {
                        role: "system",
                        content: OPENAI_BETA_CHAT_COMPLETION_PARSE_SYSTEM_MESSAGE_CONTENT
                    },
                    {
                        role: "user",
                        content: rerank_prompt + documents
                    }
                ],
                response_format: zodResponseFormat(DocumentsSchema, "documents"),
                temperature: OPENAI_BETA_CHAT_COMPLETION_PARSE_TEMPERATURE
            })

            const obj = response.choices[0].message.parsed

            let resultStr = "";

            for (const x of obj!.documents_l) {
                for (const key in x) {
                    if (Object.prototype.hasOwnProperty.call(x, key)) {
                        resultStr += `${key}: ${x[key as keyof DocumentType]} | `;
                    }
                }
                resultStr += "\n\n";
            }

            const finalResponse = await openai.chat.completions.create({
                model: OPENAI_CHAT_COMPLETIONS_MODEL,
                messages: [
                    {
                        role: "system",
                        content: generateFinalResponseSystemMessageContent(resultStr)
                    },
                    {
                        role: "user",
                        content: `${query}`
                    }
                ],
                temperature: OPENAI_FINAL_RESPONSE_CHAT_COMPLETION_TEMPERATURE
            })
            console.log('legal return ------------------')
            return finalResponse.choices[0].message.content;
        } else {
            console.log("Empty data:", data);
            return "Sorry, optimus is not smart enough to help with your request";
        }

    } catch (error) {
        console.error("Error:", error);
        return "An error occurred while processing your request.";
    }
}


export async function CreateChatSaveMessage(messages: string) {
    const supabase = await createClient()

    const { data: chatData, error: chatDataError } = await supabase
        .from('chat')
        .insert({ title: await generateTitle(messages)})
        .select()
        .single()
    console.log('insert chat ------------------------------------')
    if (chatDataError) {
        console.log(chatDataError)
        return {
            success: false,
            message: 'Failed to create new conversation window'
        }
    }

    const res = await saveMessage(messages, chatData.id, "user")

    if (res?.success) {
        return {
            success: true,
            id: chatData.id,
            message: 'Insert message successfully'
        }
    }

    return {
        success: false,
        id: null,
        message: 'Failed to insert message'
    }
}

async function generateTitle(message: string) {
    const completion = await openai.chat.completions.create({
        model: OPENAI_CHAT_COMPLETIONS_MODEL,
        messages: [
            {
                role: "system",
                content: 'Please summarise the message to generate a title'
            },
            {
                role: "user",
                content: message
            }
        ],
        temperature: OPENAI_CHAT_COMPLETIONS_TEMPERATURE
    })
    return completion.choices[0].message.content?.replace(/^["']|["']$/g, "");   
}

// async function getUser(){
//     const supabase = await createClient()
//     const {data: {user}} = await supabase.auth.getUser()
//     console.log('user:', user) 
//     return user
// }