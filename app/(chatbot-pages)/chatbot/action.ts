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

export async function botAnswer(newMessage: string, chatId: number)
    : Promise<{ success: boolean; message: string }> {

    try {
        // Fetch previous messages from Supabase
        const supabase = await createClient();
        const { data: messageHistory, error: messageError } = await supabase
            .from('Message')
            .select('messages, role')
            .eq('chat', chatId)
            .order('created_at', { ascending: true });
            
        if (messageError) {
            console.error("Error fetching message history:", messageError);
            return {
                success: false,
                message: 'Failed to retrieve conversation history'
            };
        }
        
        // Format messages for OpenAI
        const formattedMessages = messageHistory.map(msg => ({
          role: msg.role === "bot" ? "assistant" : "user",
          content: msg.messages
      }));
      
        
        // Add the new message
        formattedMessages.push({ role: "user", content: newMessage });
        
        // Make the API call with conversation history
        const completion = await openai.chat.completions.create({
            model: OPENAI_CHAT_COMPLETIONS_MODEL,
            messages: [
                {
                    role: "system",
                    content: SAVE_MESSAGE_OPENAI_CHAT_COMPLETIONS_SYSTEM_MESSAGES_CONTENT,
                },
                ...formattedMessages, // Include the conversation history
            ],
            temperature: SAVE_MESSAGE_OPENAI_CHAT_COMPLETIONS_TEMPERATURE,
            tools: TOOLS,
            tool_choice: "auto"
        });
        
        // Process the response (rest of your code)
        if (completion.choices[0].message.tool_calls) {
            for (const toolCall of completion.choices[0].message.tool_calls) {
                const args = JSON.parse(toolCall.function.arguments);
                try {
                    const {legal_advice: advice, sources} = await legal_advice(args.query, formattedMessages)
                    const saveBotMessage = await saveMessage(advice, chatId, "bot", sources)
                    return saveBotMessage
                } catch (error) {
                    return {
                        success: false,
                        message: 'Server error. Please try again later'
                    }
                }
            }
        } else {
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

export async function saveMessage(messages: string, chatId: number, role: string, sources: any)
    : Promise<{ success: boolean; message: string }> {
    const supabase = await createClient();
    const { error } = await supabase
        .from("Message")
        .insert({ messages, role, chat: chatId, sources: sources });

    if (error) {
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

async function legal_advice(query: string, conversationHistory: any[] = []): Promise<any> {
  const completion = await openai.chat.completions.create({
      model: OPENAI_CHAT_COMPLETIONS_MODEL,
      messages: [
          {
              role: "system",
              content: OPENAI_CHAT_COMPLETIONS_SYSTEM_MESSAGES_CONTENT
          },
          ...conversationHistory, // Include conversation history
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
           // input: completion.choices[0]?.message?.content as string,
            input: query,
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
            return {
                legal_advice: finalResponse.choices[0].message.content,
                sources: obj
            }
        } else {
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
    if (chatDataError) {
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