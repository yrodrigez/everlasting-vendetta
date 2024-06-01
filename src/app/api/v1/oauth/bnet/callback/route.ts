import {type NextRequest, NextResponse} from "next/server";
import {cookies} from "next/headers";
import {BNET_COOKIE_NAME} from "@/app/util/constants";

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const PRODUCTION_ORIGIN = 'https://www.everlastingvendetta.com/'
export const dynamic = 'force-dynamic'

function fromBase64(str: string) {
    return Buffer.from(str, 'base64').toString('utf-8');
}

function toJson(str: string) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return null;
    }
}

export async function GET(request: NextRequest) {
    const bnetRedirectURI = process.env.BNET_REDIRECT_URI
    if (!bnetRedirectURI) throw new Error('BNET_REDIRECT_URI not set');
    const requestURL = new URL(request.url)
    const code = requestURL.searchParams.get('code')
    const state = requestURL.searchParams.get('state')
    const stateData = state ? toJson(fromBase64(state)) : null
    if (!code) {
        return NextResponse.redirect('/')
    }
    const tokenResponse = await fetch('https://oauth.battle.net/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${process.env.BNET_CLIENT_ID}:${process.env.BNET_CLIENT_SECRET}`).toString('base64')}`,
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: bnetRedirectURI,
        }),
    });

    const tokenData = await tokenResponse.json()
    const redirectFrom = stateData?.redirectedFrom || '/'
    const windowOpener = stateData?.windowOpener

    if (code) {
        if (cookies().get(BNET_COOKIE_NAME)) {
            cookies().delete(BNET_COOKIE_NAME)
        }
        cookies().set(BNET_COOKIE_NAME, tokenData.access_token, {
            maxAge: tokenData.expires_in,
            path: '/',
            sameSite: 'lax',
            secure: true,
        })
    }

    if (windowOpener) {
        return new NextResponse(
            `<script>window.opener.postMessage('${BNET_COOKIE_NAME}', '*');window.close();</script>`,
            {
                headers: {
                    'Content-Type': 'text/html',
                },
            }
        )
    }


    if (IS_PRODUCTION) {
        return NextResponse.redirect(PRODUCTION_ORIGIN + redirectFrom)
    }

    return NextResponse.redirect(requestURL.origin + redirectFrom)
}
