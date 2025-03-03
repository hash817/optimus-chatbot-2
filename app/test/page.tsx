import { createClient } from '@supabase/supabase-js'
import Messages from '@/components/Messages'



export default async function MessagePage() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,)
    const { data } = await supabase.from('Message').select()

    return <Messages serverMessages={data ?? []} />
}