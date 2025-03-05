'use client'

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateChatSaveMessage } from "./action";
import { useRouter } from "next/navigation";

export default function Chatbot() {
    const router = useRouter()
    const [inputValue, setInputValue] = useState("")

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!inputValue.trim()) return
        setInputValue('')
        const result = await CreateChatSaveMessage(inputValue)
        if(result?.success){
            router.push(`/chatbot/${result.id}`)
        }
    }
    return (
        <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center space-y-6 text-center">
            <MessageSquare className="h-12 w-12 text-primary" />
            <h1 className="text-2xl font-bold">Welcome to Optimus AI</h1>
            <p className="text-muted-foreground">Start a conversation with the AI assistant by typing a message below.</p>
            <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Try asking:</p>
                <ul className="mt-2 space-y-2 text-sm text-left">
                    <li>• "What are the benefits of using Next.js?"</li>
                    <li>• "Write a short story about a robot learning to paint"</li>
                    <li>• "Explain quantum computing in simple terms"</li>
                </ul>
            </div>
            <form className="flex gap-2" onSubmit={handleSubmit}>
                <Input
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={handleInputChange}
                    className="flex-1"
                />
                <Button type="submit" size="icon" >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                </Button>
            </form>
        </div>

    );
}


