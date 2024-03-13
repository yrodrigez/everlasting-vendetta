import {NextRequest, NextResponse} from "next/server";

const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
import {createClient} from '@supabase/supabase-js'




export async function POST(request: NextRequest) {
    const state = await request.json()
    const supabase = createClient(supabaseUrl, supabaseKey)
    try {
        const response = await supabase.from('ev_application').insert({
            name: state.name,
            ...(state.email ? {email: state.email} : {}),
            class: state.characterClass,
            role: state.characterRole,
            message: state.message || ''
        })

        if (response.error) {
            return NextResponse.json({error: 'Error submitting application please try again with other character\'s name or email.'})
        }
    } catch (e) {
        return NextResponse.json({error: 'Error submitting application please try again with other character\'s name or email.'})
    }

    return NextResponse.json({error: null})
}
