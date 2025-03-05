'use client'

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import { MessageSquare, Plus } from "lucide-react"
import { Button } from "./ui/button"
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Chat {
    id: string;
    created_at: string;
    title: string;
}

export default function AppSidebar({ chats }: { chats: Chat[] }) {
    const router = useRouter()

    function navigateToChatbot() {
        router.push('/chatbot')
    }

    return (
        <Sidebar className="border-r">
            <SidebarHeader className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-6 w-6" />
                        <h1 className="text-xl font-bold">AI Optimus</h1>
                    </div>
                </div>
                <Button className="mt-4 w-full justify-start gap-2" variant="outline" onClick={navigateToChatbot}>
                    <Plus className="h-4 w-4" />
                        New Chat
                </Button>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {chats.map((chat) => (
                        <SidebarMenuItem key={chat.id}>
                            <SidebarMenuButton
                                className="w-full justify-start gap-2 truncate"
                            >
                                <MessageSquare className="h-4 w-4 shrink-0" />
                                <Link href={`/chatbot/${chat.id}`} className="truncate">{chat.title}</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    )
}