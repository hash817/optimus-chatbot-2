import ChatInput from '@/components/ChatInput';
import Messages from '@/components/Messages';
import { createClient } from "@/utils/supabase/server";

export default async function ChatPage({params}) {
    const supabase = await createClient()
    const { data } = await supabase.from('Message').select().eq('chat', params.chatId)

    return (
        <>
            <Messages serverMessages={data ?? []} />
            <ChatInput />
        </>

    );
}