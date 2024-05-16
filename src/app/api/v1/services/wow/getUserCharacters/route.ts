import {cookies} from "next/headers";
import {NextRequest, NextResponse} from "next/server";
import {getRealmCharacters} from "@/app/util/blizzard/battleNetWoWAccount";
import {BNET_COOKIE_NAME} from "@/app/util/constants";


export async function GET(request: NextRequest) {
    const token = cookies().get(BNET_COOKIE_NAME)
    const requestUrl = new URL(request.url)
    if (!token?.value) return NextResponse.redirect(requestUrl.origin + '/api/v1/oauth/bnet/auth')

    try {
        const characters = await getRealmCharacters({token: token.value}) ?? []
        return NextResponse.json({characters})
    } catch (e) {
        console.error('Error fetching realm characters', e)
        return NextResponse.error()
    }
}
