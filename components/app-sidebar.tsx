"use client"

import * as React from "react"
import {
  AudioWaveform,
  Blocks,
  Calendar,
  Command,
  Home,
  Inbox,
  MessageCircleQuestion,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  Plus,
  MessageSquare
} from "lucide-react"
import { Button } from "./ui/button"
import { NavFavorites } from "@/components/nav-favorites"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarFooter
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import { userInterface } from "@/components/nav-user"
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from "next/navigation";

const data = {
  navMain: [
    {
      title: "Search Judgments",
      url: "/search",
      icon: Search,
    },
    {
      title: "Ask OptimusLex",
      url: "/chatbot",
      icon: Sparkles,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
    {
      title: "Help",
      url: "#",
      icon: MessageCircleQuestion,
    },
  ],
}

interface Chat {
  id: string;
  created_at: string;
  title: string;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  chats: Chat[];
}

export function AppSidebar({ chats, ...props }: AppSidebarProps) {
  const router = useRouter()
  const [userSession, setUserSession] = useState<userInterface>({
    name: '',
    email: '',
  })
  const supabase = createClient()
  function navigateToChatbot() {
    router.push('/chatbot')
  }

  useEffect (() => {
     supabase.auth.getUser().then((session) => {
       console.log(session)
       setUserSession({
        name: session.data.user!.email!.substring(0, session.data.user!.email!.indexOf('@')) as string,
        email:session.data.user!.email as string,
      })
     });
   }, [])
 
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            <h1 className="text-xl font-bold">OptimusLex</h1>
          </div>
        </div>
        <Button className="mt-4 w-full justify-start gap-2" variant="outline" onClick={navigateToChatbot}>
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <NavFavorites favorites={chats} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userSession!} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
