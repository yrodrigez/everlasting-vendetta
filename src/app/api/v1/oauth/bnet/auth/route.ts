import {type NextRequest, NextResponse} from "next/server";

function toBase64(str: string) {
    return Buffer.from(str).toString('base64');
}

export async function GET(request: NextRequest) {
    if (!process.env.BNET_CLIENT_ID) throw new Error('BNET_CLIENT_ID not set');
    if (!process.env.BNET_REDIRECT_URI) throw new Error('BNET_REDIRECT_URI not set');
    const redirectUri = process.env.BNET_REDIRECT_URI
    if (!redirectUri) throw new Error('BNET_REDIRECT_URI not set');
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const redirectedFrom = searchParams.get('redirectedFrom');
    const randomValue = Math.ceil(Math.random() * 10000000);
    const state = toBase64(JSON.stringify({redirectedFrom, randomValue}));
    const scopes = ['wow.profile'].join(',');
    const responseType = 'code';

    const requestParams = new URLSearchParams({
        response_type: responseType,
        client_id: process.env.BNET_CLIENT_ID,
        redirect_uri: redirectUri,
        scope: scopes,
        state: state,
    });
    const authUrl = `https://oauth.battle.net/authorize?${requestParams.toString()}`;

    return NextResponse.redirect(authUrl) // Redirect to the Battle.net OAuth page
}
