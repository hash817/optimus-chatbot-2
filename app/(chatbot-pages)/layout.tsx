import type { Metadata } from "next";
import { AppSidebar } from "@/components/app-sidebar"
import { NavActions } from "@/components/nav-actions"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SourceSidebar from "@/components/SourceSidebar";

export const metadata: Metadata = {
  title: "OptimusLex - AI-Powered Legal Chatbot for Singapore",
  description: "OptimusLex is an AI-driven legal chatbot specializing in Singapore law.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/sign-in')
  }
  const { data } = await supabase
  .from('chat')
  .select()
  .order('created_at', { ascending: false });

  return (
    <>
      <SidebarProvider>
        <AppSidebar chats={data ?? []} />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 px-4">
            <div className="mb-20 mx-auto h-full w-full max-w-3xl">
              {children}
            </div>
          </div>
        </SidebarInset>
        <SourceSidebar />
      </SidebarProvider>
    </>
  )
}