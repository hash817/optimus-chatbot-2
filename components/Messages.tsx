'use client'

import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

interface Message {
    id: number;
    created_at: string;
    sender: "user" | "bot";
    text: string;
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

    return <pre>{JSON.stringify(messages, null, 2)}</pre>
}