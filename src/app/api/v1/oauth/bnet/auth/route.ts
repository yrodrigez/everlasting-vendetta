import {NextResponse} from "next/server";

export async function GET() {
    if (!process.env.BNET_CLIENT_ID) throw new Error('BNET_CLIENT_ID not set');
    if (!process.env.BNET_REDIRECT_URI) throw new Error('BNET_REDIRECT_URI not set');
    const redirectUri = process.env.BNET_REDIRECT_URI
    if (!redirectUri) throw new Error('BNET_REDIRECT_URI not set');
    const randomValue = Math.ceil(Math.random() * 10000000);
    const state = randomValue.toString();
    const scopes = ['wow.profile'].join(',');
    const responseType = 'code';
    const requestParams = new URLSearchParams({
        response_type: responseType,
        client_id: process.env.BNET_CLIENT_ID,
        redirect_uri: redirectUri,
        scope: scopes,
        state: state
    });
    const authUrl = `https://oauth.battle.net/authorize?${requestParams.toString()}`;

    return NextResponse.redirect(authUrl)
}
