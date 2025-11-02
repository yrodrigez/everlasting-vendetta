import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { ANON_KEY, FUNCTION_BASE_URL } from "@/app/api/v1/supabase/util";
import createServerSession from "@utils/supabase/createServerSession";


export async function POST(request: NextRequest) {

    const { character } = await request.json()
    if (!character) {
        return NextResponse.json({ error: 'Error - character is mandatory!' })
    }

    const { getSupabase } = await createServerSession();
    const supabase = await getSupabase()
    const { data } = await supabase.functions.invoke('everlasting-vendetta', {});

    const evToken = await fetch(`${FUNCTION_BASE_URL}/functions/v1/ev_token_generate`, {
        method: 'POST',
        body: JSON.stringify({ blizzardToken: data.token, selectedCharacter: character, source: 'temporal' }),
        headers: {
            'Authorization': 'Bearer ' + ANON_KEY,
        },
    });

    if (!evToken.ok) {
        (await cookies()).delete(process.env.BNET_COOKIE_NAME!)
        const { error } = await evToken.json()
        let errorText = 'Error: ' + error || evToken.statusText
        if (error && error.indexOf && error.indexOf('bnet_oauth') > -1) {
            errorText = 'This character is already linked to a Battle.net account. Please log in with the correct account.'
        }
        return NextResponse.json(
            { error: errorText },
            { status: 500 }
        )
    }


    const evTokenData = await evToken.json()
    if (evTokenData.error) {
        (await cookies()).delete(process.env.BNET_COOKIE_NAME!)
        return NextResponse.json({ error: 'Error fetching EV token: ' + evTokenData.error }, {
            status: 500
        })
    }

    if ((await cookies()).get(process.env.EV_COOKIE_NAME!)) {
        (await cookies()).delete(process.env.EV_COOKIE_NAME!)
    }

    if ((await cookies()).get(process.env.BNET_COOKIE_NAME!)) {
        (await cookies()).delete(process.env.BNET_COOKIE_NAME!)
    }

    (await cookies()).set(process.env.BNET_COOKIE_NAME!, data.token, {
        maxAge: 60 * 60, // 1 hour
        sameSite: 'lax',
        secure: true,
        path: '/',
    });

    (await cookies()).set(process.env.EV_COOKIE_NAME!, evTokenData.access_token, {
        maxAge: 60 * 60, // 1 hour
        path: '/',
        sameSite: 'lax',
        secure: true,
    })


    return NextResponse.json({ ...evTokenData, character })
}
