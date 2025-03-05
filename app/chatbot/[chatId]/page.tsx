import ChatInput from '@/components/ChatInput';
import Messages from '@/components/Messages';
import { createClient } from '@supabase/supabase-js'

export default async function ChatPage({params}) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,)
    const { data } = await supabase.from('Message').select().eq('chat', params.chatId)

    return (
        <>
            <Messages serverMessages={data ?? []} />
            <ChatInput />
        </>

    );
}