import { getEnvironment } from "@/infrastructure/environment";
import { type NextRequest, NextResponse } from "next/server";

function toBase64(str: string) {
    return Buffer.from(str).toString('base64');
}

export async function GET(request: NextRequest) {
    const { bnetClientId, bnetRedirectUri } = getEnvironment();
    if (!bnetClientId) throw new Error('BNET_CLIENT_ID not set');
    if (!bnetRedirectUri) throw new Error('BNET_REDIRECT_URI not set');
    const redirectUri = bnetRedirectUri;
    if (!redirectUri) throw new Error('BNET_REDIRECT_URI not set');
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const redirectedFrom = searchParams.get('redirectedFrom');
    const isWindowOpener = Boolean(searchParams.get('windowOpener') ?? '');
    const randomValue = Math.ceil(Math.random() * 10000000);
    const state = toBase64(JSON.stringify({ redirectedFrom, randomValue, windowOpener: isWindowOpener }));
    const scopes = ['wow.profile'].join(',');
    const responseType = 'code';

    const requestParams = new URLSearchParams({
        response_type: responseType,
        client_id: bnetClientId,
        redirect_uri: redirectUri,
        scope: scopes,
        state: state,
    });
    const authUrl = `https://oauth.battle.net/authorize?${requestParams.toString()}`;

    return NextResponse.redirect(authUrl) // Redirect to the Battle.net OAuth page
}
