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
          className={cn(
              "flex items-start gap-4 p-4 rounded-lg ",
              message.role === "user" ? "ml-auto bg-muted/50" : "bg-primary/5"
          )}
      >
          <div className="flex h-8 w-8 select-none items-center justify-center rounded-md border bg-background shadow">
              {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </div>
          <div className="flex-1 space-y-2 overflow-hidden">
              <p className="font-medium">{message.role === "user" ? "You" : "AI Assistant"}</p>
              <p className="">{message.messages}</p>
          </div>
      </div>
  )
}

