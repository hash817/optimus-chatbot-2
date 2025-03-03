import ChatInput from '@/components/ChatInput';
import Messages from '@/components/Messages';
import { createClient } from '@supabase/supabase-js'

export default async function Chatbot() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,)
    const { data } = await supabase.from('Message').select()

    return (
        <div className="flex flex-col h-screen p-4 bg-gray-100 dark:bg-gray-900">
            <Messages serverMessages={data ?? []} />
            <ChatInput />
        </div>
    );
}
