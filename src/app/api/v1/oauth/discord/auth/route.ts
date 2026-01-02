import { getEnvironment } from "@/infrastructure/environment";
import {type NextRequest, NextResponse} from "next/server";

function toBase64(str: string) {
    return Buffer.from(str).toString('base64');
}

export async function GET(request: NextRequest) {
    const { discordClientId, discordRedirectUri } = getEnvironment();
    if (!discordClientId) throw new Error('DISCORD_CLIENT_ID not set');
    if (!discordRedirectUri) throw new Error('DISCORD_REDIRECT_URI not set');

    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const redirectedFrom = searchParams.get('redirectedFrom');
    const isWindowOpener = Boolean(searchParams.get('windowOpener') ?? '');
    const isLinkedAccount = Boolean(searchParams.get('linkAccount') ?? '');
    const randomValue = Math.ceil(Math.random() * 10000000);
    const state = toBase64(JSON.stringify({redirectedFrom, randomValue, windowOpener: isWindowOpener, linkAccount: isLinkedAccount}));
    const scopes = ['identify', 'guilds'].join(' ');
    const responseType = 'code';

    const requestParams = new URLSearchParams({
        response_type: responseType,
        client_id: discordClientId,
        redirect_uri: discordRedirectUri,
        scope: scopes,
        state: state,
    });
    const authUrl = `https://discord.com/api/oauth2/authorize?${requestParams.toString()}`;

    return NextResponse.redirect(authUrl);
}