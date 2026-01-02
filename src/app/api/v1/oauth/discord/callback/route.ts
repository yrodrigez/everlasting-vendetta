import { type NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { getEnvironment } from "@/infrastructure/environment";
import { SESSION_INFO_COOKIE_KEY } from "@/app/util/constants";
import { decrypt } from "@/app/util/auth/crypto";
import createServerSession from "@/app/util/supabase/createServerSession";

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
        console.error('No code provided in Discord OAuth callback');
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

    const redirectFrom = stateData?.redirectedFrom || '/';
    const windowOpener = stateData?.windowOpener;
    const linkAccount = stateData?.linkAccount;

    if (!tokenResponse.ok) {
        console.error('Discord token exchange failed', tokenData);
        return NextResponse.redirect(requestURL.origin + '/?error=discord_token_exchange_failed');
    }

    if (linkAccount) {
        const { auth, accessToken } = await createServerSession();
        const session = await auth.getSession();
        console.log('[Discord Callback] session result:', { hasSession: !!session, sessionId: session?.id });

        if (!session || !accessToken) {
            console.error('No authenticated session found for linking Discord account');
            return NextResponse.redirect(requestURL.origin + '/?error=not_logged_in');
        }

        console.log('Linking Discord account for user:', session.id, tokenData, accessToken);
        const linkResponse = await fetch(`${evApiUrl}/auth/link-oauth-account`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                provider: 'discord',
                accessToken: tokenData.access_token,
                tokenExpiresAt: (Date.now() + tokenData.expires_in * 1000) / 1000,
                refreshToken: tokenData.refresh_token
            })
        });

        if (!linkResponse.ok) {
            console.error('Linking Discord account failed');
            return NextResponse.redirect(requestURL.origin + '/?error=link_account_failed');
        }

        if (windowOpener) {
            return new NextResponse(
                `<script>
                window.opener.postMessage({
                    type: 'LINK_SUCCESS'
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

        return NextResponse.redirect(requestURL.origin + redirectFrom);
    }


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
            refresh_token: tokenData.refresh_token
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