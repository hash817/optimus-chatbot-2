import OpenAI from "openai";
import { z } from "zod";

export const TOOLS: OpenAI.ChatCompletionTool[] = [
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

export const OPENAI_CHAT_COMPLETIONS_SYSTEM_MESSAGES_CONTENT = `You are a legal assistant for Singapore Law. 
        Analyze the user's query and provide a document of relevant sections from Singapore Acts and Statutues that will give insights for his conerns.
        You do not have to explain your document, just provide them in a concise format`

export const OPENAI_CHAT_COMPLETIONS_TEMPERATURE = 0

export const OPENAI_CHAT_COMPLETIONS_MODEL = "gpt-4o-mini"

export const OPENAI_EMBEDDING_MODEL = "text-embedding-3-small"

export const OPENAI_EMBEDDING_ENCODING_FORMAT = "float"

export const SUPABASE_RPC_MATCH_THRESHOLD = 0.5

export const SUPABASE_RPC_MATCH_COUNT = 10

export const OPENAI_BETA_CHAT_COMPLETION_PARSE_SYSTEM_MESSAGE_CONTENT = "You are a legal assistant for Singapore Law."

export const OPENAI_BETA_CHAT_COMPLETION_PARSE_TEMPERATURE = 0

export const OPENAI_FINAL_RESPONSE_CHAT_COMPLETION_TEMPERATURE = 0

export const SAVE_MESSAGE_OPENAI_CHAT_COMPLETIONS_SYSTEM_MESSAGES_CONTENT = `You are OptimusLex, an AI chatbot specializing in Singapore law. You have access to the following tool and are permitted to use each tool only once:
- **'legal_advice'**: This tool provides legal advice and summaries of Singapore laws. Use it only when a user asks a question related to Singapore law.
For all other queries, including greetings or unrelated topics, respond with:  
"Hello, I am OptimusLex. How may I help you?"`

export const SAVE_MESSAGE_OPENAI_CHAT_COMPLETIONS_TEMPERATURE = 0

export function generateFinalResponseSystemMessageContent(resultStr: string) {
    return `You are a legal assistant for Singapore Law.
            Here are some documents retrieved from various Singapore Acts to help you answer the user query.\n\n
            ${resultStr}`
}

export function generateRerankPrompt(query: string) {
    return `These are some documents retrieved from various Singapore Law Acts and Statutes. Evaluate them and find out the most relevant and helpful documents to answer the user query. You can respond with either one or multiple documents depending on how relevant and helpful they are to the user query but strictly no returning duplicate of documents.\n\nThe user's query: ${query}\n\n`;
}

interface Message {
    id: number;
    created_at: string;
    role: "user" | "bot";
    messages: string;
}

export const DocumentSchema = z.object({
    act: z.string(),
    part_id: z.string(),
    part_title: z.string(),
    title: z.string(),
    content: z.string(),
});

export type DocumentType = z.infer<typeof DocumentSchema>;

export const DocumentsSchema = z.object({
    documents_l: z.array(DocumentSchema),
});

export function generateDocument(x: DocumentType) {
    return `Act: ${x.act ?? ""} | Part section: ${x.part_id ?? ""} | Part title: ${x.part_title ?? ""} | Section title: ${x.title ?? ""} | Section content: ${x.content ?? ""}\n\n`
}

