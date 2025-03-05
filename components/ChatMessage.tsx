import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"

interface Message {
    id: number;
    created_at: string;
    role: "user" | "bot";
    messages: string;
}

export function ChatMessage({ message }: { message: Message }) {
    return (
        <div
            className={cn("w-full flex-1 items-start gap-4 p-4 rounded-lg", message.role === "user" ? "bg-muted/50" : "bg-primary/5")}
        >
            <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
                {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className="flex-1 space-y-2 overflow-hidden">
                <div className="font-semibold">{message.role === "user" ? "You" : "AI Assistant"}</div>
                <div className="">{message.messages}</div>
            </div>
        </div>
    )
}

