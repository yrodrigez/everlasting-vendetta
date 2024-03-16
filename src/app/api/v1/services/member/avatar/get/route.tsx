import {NextRequest, NextResponse} from "next/server";
import {cookies} from "next/headers";
import {fetchCharacterAvatar} from "@/app/lib/fetchCharacterAvatar";
import {getBlizzardToken} from "@/app/lib/getBlizzardToken";


export async function GET(request: NextRequest) {
    const url = new URL(request.url)
    let tokenString = url.searchParams.get('tokenString')
    const realm = url.searchParams.get('realm')
    const characterName = url.searchParams.get('characterName')

    if (!realm || !characterName) {
        return NextResponse.json({error: 'Error - realm and characterName are mandatory!'})
    }

    if (!tokenString) {
        tokenString = cookies().get(process.env.BNET_COOKIE_NAME!)?.value || (await getBlizzardToken()).token
    }
    if (!tokenString) {
        return NextResponse.redirect(url.origin + '/api/v1/oauth/bnet/auth')
    }

    const avatar = await fetchCharacterAvatar(tokenString, realm, characterName)
    return NextResponse.json({avatar})
}
