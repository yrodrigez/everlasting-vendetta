import {NextRequest, NextResponse} from "next/server";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {ANON_KEY, FUNCTION_BASE_URL} from "@/app/api/v1/supabase/util";

export async function POST(request: NextRequest) {
    const bnetToken = cookies().get(process.env.BNET_COOKIE_NAME!)

    if (!bnetToken) {
        console.log('No Bnet token found, redirecting to the auth route')
        const url = new URL(request.url)

        return redirect(url.origin + '/api/v1/oauth/bnet/auth')
    }

    const {character} = await request.json()
    if (!character) {
        return NextResponse.json({error: 'Error - character is mandatory!'}, {
            status: 400
        })
    }

    const evToken = await fetch(`${FUNCTION_BASE_URL}/functions/v1/ev_token_generate`, {
        method: 'POST',
        body: JSON.stringify({blizzardToken: bnetToken.value, selectedCharacter: character}),
        headers: {
            'Authorization': 'Bearer ' + ANON_KEY,
        },
    });

    if (!evToken.ok) {
        cookies().delete(process.env.BNET_COOKIE_NAME!)
        return NextResponse.json({error: 'Error fetching EV token: ' + evToken.statusText},{
            status: 500
        })
    }


    const evTokenData = await evToken.json()
    if (evTokenData.error) {
        cookies().delete(process.env.BNET_COOKIE_NAME!)
        return NextResponse.json({error: 'Error fetching EV token: ' + evTokenData.error}, {
            status: 500
        })
    }

    if (cookies().get(process.env.EV_COOKIE_NAME!)) {
        cookies().delete(process.env.EV_COOKIE_NAME!)
    }

    cookies().set(process.env.EV_COOKIE_NAME!, evTokenData.access_token, {
        maxAge: 60 * 60 * 23, // 23 hours
        path: '/',
        sameSite: 'lax',
        secure: true,
    })

    return NextResponse.json({...evTokenData, character})
}
