import {cookies} from "next/headers";
import {NextRequest, NextResponse} from "next/server";

async function fetchBattleNetProfile(token: string) {
    if (!token) throw new Error('fetchBattleNetProfile - token parameter is required')
    const url = 'https://eu.api.blizzard.com/profile/user/wow?namespace=profile-classic1x-eu&locale=en_US'
    const headers = new Headers()
    headers.append('Authorization', 'Bearer ' + token)

    const response = await fetch(url, {
        method: 'GET',
        headers: headers,
    });

    return await response.json();
}

export async function GET(request: NextRequest) {
    const token = cookies().get('bnetToken')
    const requestUrl = new URL(request.url)
    if (!token?.value) return NextResponse.redirect(requestUrl.origin + '/api/v1/oauth/bnet/auth')

    const profile = await fetchBattleNetProfile(token.value)

    return NextResponse.json(profile)
}
