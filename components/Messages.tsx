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
const sample_data: Message[] = [
  {
    id: 1,
    created_at: "2025-03-05T10:00:00Z",
    role: "user",
    chat: 101,
    messages: "aaaaaaaaaaaaa aaaaaaaaaaaaaaaa aaaaaa",
  },
  {
    id: 2,
    created_at: "2025-03-05T10:00:05Z",
    role: "bot",
    chat: 101,
    messages: "aaaa a a a a",
  },
  {
    id: 3,
    created_at: "2025-03-05T10:02:30Z",
    role: "user",
    chat: 102,
    messages: "aaa",
  },
  {
    id: 4,
    created_at: "2025-03-05T10:03:00Z",
    role: "user",
    chat: 102,
    messages: "aaa",
  },
];

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
    <div className="flex flex-col items-start space-y-6 ">
      {messages.map((message, index) => (
        <ChatMessage key={index} message={message} />
      ))}
    </div>
  )
}