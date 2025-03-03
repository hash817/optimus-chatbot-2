'use client'

import React, { useRef } from "react";
import saveMessage from "@/app/chatbot/action";
import { useFormStatus } from "react-dom";

export default function ChatInput() {
    const formRef = useRef<HTMLFormElement>(null)
    const { pending } = useFormStatus()
    console.log(pending)

    async function handlerSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const fd = new FormData(form);

        const message = fd.get('message') as string;
        console.log(message)
        await saveMessage(message)
        if (formRef.current) {
            formRef.current.reset()
        }
    }

    return (
        <form ref={formRef} className="mt-4 flex items-center space-x-2" onSubmit={handlerSubmit}>
            <input
                type="text"
                name="message"
                placeholder="Ask an question about law"
                className="flex-1 p-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
            />
            <button
                type="submit"
                disabled={pending}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
                {pending ? 'Sending' : 'Send'}
            </button>
        </form>

    )
}