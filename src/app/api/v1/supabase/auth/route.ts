import {NextRequest, NextResponse} from "next/server";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const FUNCTION_BASE_URL = IS_PRODUCTION ? process.env.NEXT_PUBLIC_SUPABASE_URL : process.env.DEV_FUNCTION_BASE_URL

export async function POST(request: NextRequest) {
    const bnetToken = cookies().get(process.env.BNET_COOKIE_NAME!)

    if (!bnetToken) {
        console.log('No Bnet token found, redirecting to the auth route')
        const url = new URL(request.url)

        return redirect(url.origin + '/api/v1/oauth/bnet/auth')
    }

    const {character} = await request.json()
    if (!character) {
        return NextResponse.json({error: 'Error - character is mandatory!'})
    }

    const evToken = await fetch(`${FUNCTION_BASE_URL}/functions/v1/ev_token_generate`, {
        method: 'POST',
        body: JSON.stringify({blizzardToken: bnetToken.value, selectedCharacter: character}),
        headers: {
            'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'//process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
    });


    const evTokenData = await evToken.json()
    if (evTokenData.error) {
        return NextResponse.json({error: 'Error fetching EV token: ' + evTokenData.error})
    }

    cookies().set(process.env.EV_COOKIE_NAME!, evTokenData.access_token, {
        maxAge: evTokenData.expires_in,
        path: '/',
        sameSite: 'lax',
        secure: IS_PRODUCTION,
        //httpOnly: true
    })

    return NextResponse.json({...evTokenData, character})
}
