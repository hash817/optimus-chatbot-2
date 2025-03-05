import { MessageSquare } from "lucide-react"

export function EmptyScreen() {
    return (
        <div className="flex  flex-col items-center justify-center w-full min-h-screen text-center">
            <MessageSquare className="h-12 w-12 text-primary" />
            <h1 className="text-2xl font-bold">Welcome to AI Chat</h1>
            <p className="text-muted-foreground">Start a conversation with the AI assistant by typing a message below.</p>
            <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Try asking:</p>
                <ul className="mt-2 space-y-2 text-sm text-left">
                    <li>• "What are the benefits of using Next.js?"</li>
                    <li>• "Write a short story about a robot learning to paint"</li>
                    <li>• "Explain quantum computing in simple terms"</li>
                </ul>
            </div>
        </div>
    )
}

