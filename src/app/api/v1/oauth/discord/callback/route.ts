import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getEnvironment } from "@/infrastructure/environment";

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const PRODUCTION_ORIGIN = 'https://www.everlastingvendetta.com/';

export const dynamic = 'force-dynamic';

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
    const { refreshTokenCookieKey, discordRedirectUri, discordClientId, discordClientSecret, evApiUrl } = getEnvironment();
    if (!discordRedirectUri) throw new Error('DISCORD_REDIRECT_URI not set');

    const requestURL = new URL(request.url);
    const code = requestURL.searchParams.get('code');
    const state = requestURL.searchParams.get('state');
    const stateData = state ? toJson(fromBase64(state)) : null;

    if (!code) {
        return NextResponse.redirect('/');
    }

    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: discordClientId,
            client_secret: discordClientSecret,
            grant_type: 'authorization_code',
            code,
            redirect_uri: discordRedirectUri,
        }),
    });

    const tokenData = await tokenResponse.json();
    console.log('Discord token response status:', tokenData);
    const redirectFrom = stateData?.redirectedFrom || '/';
    const windowOpener = stateData?.windowOpener;

    // Exchange Discord token for your auth system tokens
    const authResponse = await fetch(`${evApiUrl}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            provider: 'discord',
            access_token: tokenData.access_token,
            expires_at: (Date.now() + tokenData.expires_in * 1000) / 1000,
        })
    });

    if (!authResponse.ok) {
        console.error('Auth token generation failed');
        return NextResponse.redirect(requestURL.origin + '/?error=auth_failed');
    }

    const { refreshToken, refreshTokenExpiry } = await authResponse.json();
    console.log('Auth token generated successfully');

    (await cookies()).set(refreshTokenCookieKey, refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.everlastingvendetta.com' : 'localhost',
        maxAge: refreshTokenExpiry
    });

    if (windowOpener) {
        return new NextResponse(
            `<script>
                window.opener.postMessage({
                    type: 'AUTH_SUCCESS'
                }, '*');
                window.close();
            </script>`,
            {
                headers: {
                    'Content-Type': 'text/html',
                },
            }
        );
    }

    if (IS_PRODUCTION) {
        return NextResponse.redirect(PRODUCTION_ORIGIN + redirectFrom);
    }

    return NextResponse.redirect(requestURL.origin + redirectFrom);
}