import {cookies} from "next/headers";
import {NextRequest, NextResponse} from "next/server";
import {fetchBattleNetProfile} from "@/app/util/blizzard/battleNetWoWAccount";


export async function GET(request: NextRequest) {
    const token = cookies().get('bnetToken')
    const requestUrl = new URL(request.url)
    if (!token?.value) return NextResponse.redirect(requestUrl.origin + '/api/v1/oauth/bnet/auth')

    const profile = await fetchBattleNetProfile(token.value)

    return NextResponse.json(profile)
}
