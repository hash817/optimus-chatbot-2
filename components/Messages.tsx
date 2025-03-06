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
        <div className="flex flex-col items-start space-y-6">
            <div className="space-y-6 pb-20">
                {messages.map((message, index) => (
                    <ChatMessage key={index} message={message} />
                ))}
                {errorMessage != '' && <ChatMessage message={errorMessage}/>}
                {isLoading && <LoadingDots />}
                
            </div>
        </div>
    )
//   return (
//     <div className="flex flex-col items-start space-y-6 ">
//       {messages.map((message, index) => (
//         <ChatMessage key={index} message={message} />
//       ))}
//     </div>
//   )
}