"use client"

import type React from "react"
import { useState, useEffect, useContext } from "react"
import { ChatMessage } from "@/components/ChatMessage"
import { createClient } from "@supabase/supabase-js";
import { UiContext } from "@/store/ui-context";
import { Bot } from "lucide-react";

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
    }, [supabase, setMessages])

    return (
        <div className="flex flex-col items-start space-y-6">
            {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
            ))}
            {
                errorMessage && (
                    <div
                        className="flex items-start gap-4 p-4 rounded-lg bg-primary/5"
                    >
                        <div className="flex h-8 w-8 select-none items-center justify-center rounded-md border bg-background shadow">
                            <Bot className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-2 overflow-hidden">
                            <p className="font-medium">AI Assistant</p>
                            <p className="">{errorMessage}</p>
                        </div>
                    </div>
                )

            }
            {isLoading && <LoadingDots />}
        </div>
    )
}