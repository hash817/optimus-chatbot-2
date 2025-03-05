'use client'

import React, { useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import saveMessage from "@/app/chatbot/action";

export default function ChatInput() {
    const [inputValue, setInputValue] = useState("")

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if(!inputValue.trim()) return
        setInputValue('')
        await saveMessage(inputValue)
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 md:left-64">
            <form
                onSubmit={handleSubmit}
                className="relative flex items-center rounded-lg border bg-background shadow-sm"
            >
                <Input
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={handleInputChange}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                // className={cn("absolute right-1", isLoading && "animate-pulse")}
                // disabled={isLoading || !inputValue.trim()}
                >
                    <Send className="h-5 w-5" />
                </Button>
            </form>
        </div>

    )
}