"use client"

import type React from "react"
import { useState, useEffect, useContext } from "react"
import { ChatMessage } from "@/components/ChatMessage"
import { createClient } from "@supabase/supabase-js";
import { UiContext } from "@/store/ui-context";

interface Message {
    id: number;
    created_at: string;
    role: "user" | "bot";
    chat: number;
    messages: string;
}

const LoadingDots = () => {
    return (
        <div
            className="w-full flex-1 items-start gap-4 p-4 rounded-lg bg-primary/5"
        >
            <span className="flex space-x-1">
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
                <span className="animate-bounce delay-300">.</span>
            </span>
        </div>

    );
};

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Message({ serverMessages }: { serverMessages: Message[] }) {
    const { isLoading, errorMessage } = useContext(UiContext)
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
        <div className="flex-1 overflow-auto p-4">
            <div className="space-y-6 pb-20">
                {messages.map((message, index) => (
                    <ChatMessage key={index} message={message} />
                ))}
                {errorMessage != '' && <ChatMessage message={errorMessage}/>}
                {isLoading && <LoadingDots />}
                
            </div>
        </div>
    )
}