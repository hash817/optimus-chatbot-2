"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChatMessage } from "@/components/ChatMessage"
import { createClient } from "@supabase/supabase-js";

interface Message {
    id: number;
    created_at: string;
    role: "user" | "bot";
    chat: number;
    messages: string;
}

export default function Message({ serverMessages }: { serverMessages: Message[] }) {
    const [messages, setMessages] = useState(serverMessages)
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

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
        <div className="p-4">
            <div className="flex space-y-6 pb-20">
                {messages.map((message, index) => (
                    <ChatMessage key={index} message={message} />
                ))}
            </div>
        </div>
    )
}