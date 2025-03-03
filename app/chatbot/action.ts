'use server'

import { createClient } from '@supabase/supabase-js'

interface Message {
    id: number;
    created_at: string;
    role: "user" | "bot";
    messages: string;
}

// export default async function saveMessage(prevState: { error: string } | undefined, formData: FormData)
//     : Promise<{ error: string } | undefined> {
//     console.log('test')
//     const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,
//         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,)
//     const messages = formData?.get('message')
//     if (!messages) {
//         return
//     }
//     const { error } = await supabase
//         .from('Message')
//         .insert({ messages, role: 'user' })

//     if (error) {
//         console.log(error)
//         return {
//             error: 'Server is busy'
//         }
//     }
// }

export default async function saveMessage(messages: string)
    : Promise<{ error: string } | undefined> {
    console.log('test')
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,)
    if (!messages) {
        return
    }
    const { error } = await supabase
        .from('Message')
        .insert({ messages, role: 'user' })

    if (error) {
        console.log(error)
        return {
            error: 'Server is busy'
        }
    }
}