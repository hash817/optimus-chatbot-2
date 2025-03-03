// 'use client'

// import { useState } from "react";
// import { createClient } from "@/utils/supabase/client";
// import { createClient } from "@/utils/supabase/server";
import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,)


interface Message {
    id: number;
    created_at: string;
    sender: "user" | "bot";
    text: string;
}

export default async function Home() {
    // const [messages, setMessages] = useState<Message[]>([
    //     { sender: "user", text: 'test' },
    //     { sender: "bot", text: 'I don understand.' }
    // ]);
    // const [input, setInput] = useState("");


    const { data, error } = await supabase
        .from('Message')
        .select()

    console.log(data)
    

    // const handleSendMessage = async () => {
    //     if (!input.trim()) return;
    //     setInput("");

    //     // run server action 
    // };

    return (
        <div className="flex flex-col h-screen p-4 bg-gray-100 dark:bg-gray-900">
            <div className="flex-1 overflow-y-auto space-y-2 p-4 border rounded-lg bg-white dark:bg-gray-800">
                {/* {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`p-2 rounded-lg w-fit max-w-xs ${msg.sender === "user"
                            ? "bg-blue-500 text-white self-end ml-auto"
                            : "bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
                            }`}
                    >
                        {msg.text}
                    </div>
                ))} */}
            </div>

            <div className="mt-4 flex items-center space-x-2">

                <input
                    type="text"
                    // value={input}
                    // onChange={(e) => setInput(e.target.value)}
                    className="flex-1 p-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="Type a message..."
                />
                <button
                    type="submit"
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Send
                </button>

            </div>
        </div>
    );
}
