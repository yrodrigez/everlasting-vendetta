import {NextRequest, NextResponse} from "next/server";

import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";

export async function POST(request: NextRequest) {
    const state = await request.json()
    const supabase = createServerComponentClient({cookies})
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
        console.error('Error submitting application:', e)
        return NextResponse.json({error: 'Error submitting application please try again with other character\'s name or email.'})
    }

    return NextResponse.json({error: null})
}
