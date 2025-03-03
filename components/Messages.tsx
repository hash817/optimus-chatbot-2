'use client'

import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

interface Message {
    id: number;
    created_at: string;
    role: "user" | "bot";
    messages: string;
}

export default function Messages({ serverMessages }: { serverMessages: Message[] }) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    const [messages, setMessages] = useState(serverMessages)

    useEffect(() => {
        const channel = supabase.channel('supabase_realtime').on('postgres_changes', {
            event: 'INSERT', schema: 'public', table: 'Message'
        }, (payload) => {
            setMessages(prev => [...prev, payload.new as Message])
        }).subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, messages, setMessages])

    return (
        <div className="flex-1 overflow-y-auto space-y-2 p-4 border rounded-lg bg-white dark:bg-gray-800">
            {messages.map((msg, index) => (
                <div
                    key={index}
                    className={`p-2 rounded-lg w-fit max-w-xs ${msg.role === "user"
                        ? "bg-blue-500 text-white self-end ml-auto"
                        : "bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
                        }`}
                >
                    {msg.messages}
                </div>
            ))}
        </div>
    )
}