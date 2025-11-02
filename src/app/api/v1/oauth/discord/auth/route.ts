import {type NextRequest, NextResponse} from "next/server";

function toBase64(str: string) {
    return Buffer.from(str).toString('base64');
}

export async function GET(request: NextRequest) {
    if (!process.env.DISCORD_CLIENT_ID) throw new Error('DISCORD_CLIENT_ID not set');
    if (!process.env.DISCORD_REDIRECT_URI) throw new Error('DISCORD_REDIRECT_URI not set');

    const redirectUri = process.env.DISCORD_REDIRECT_URI;
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const redirectedFrom = searchParams.get('redirectedFrom');
    const isWindowOpener = Boolean(searchParams.get('windowOpener') ?? '');
    const randomValue = Math.ceil(Math.random() * 10000000);
    const state = toBase64(JSON.stringify({redirectedFrom, randomValue, windowOpener: isWindowOpener}));
    const scopes = ['identify', 'guilds'].join(' ');
    const responseType = 'code';

    const requestParams = new URLSearchParams({
        response_type: responseType,
        client_id: process.env.DISCORD_CLIENT_ID,
        redirect_uri: redirectUri,
        scope: scopes,
        state: state,
    });
    const authUrl = `https://discord.com/api/oauth2/authorize?${requestParams.toString()}`;

    return NextResponse.redirect(authUrl);
}