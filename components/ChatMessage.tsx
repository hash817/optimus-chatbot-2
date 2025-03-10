import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"
import ReactMarkdown from "react-markdown";
import { Button } from "./ui/button";
import { Link } from "lucide-react";
import { useContext } from "react";
import { UiContext } from "@/store/ui-context";

interface Message {
    id: number;
    created_at: string;
    role: "user" | "bot";
    messages: string;
}

export function ChatMessage({ message }: { message: Message }) {
  const { setSelectedMessageId } = useContext(UiContext)
    return (
        <div className="relative">
            {message.role === "bot" && <Button
                variant="ghost" size="sm"
                className="absolute top-2 right-2 text-xs"
                onClick={() => setSelectedMessageId(message.id)}
            >
                <Link className="h-4 w-4 mr-1" />
                Source
            </Button>}

            <div
                className={cn(
                    "flex items-start gap-4 p-4 rounded-lg",
                    message.role === "user" ? "ml-auto bg-muted/50" : "bg-primary/5"
                )}
            >
                <div className="flex h-8 w-8 select-none items-center justify-center rounded-md border bg-background shadow">
                    {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div className="flex-1 space-y-2 overflow-hidden">
                    <p className="font-medium">{message.role === "user" ? "You" : "AI Assistant"}</p>
                    <ReactMarkdown>{message.messages}</ReactMarkdown>
                </div>
            </div>
        </div>
    )
}
