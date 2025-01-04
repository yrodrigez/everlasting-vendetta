// getCharacterByNameRoute
import {cookies} from "next/headers";
import {NextRequest, NextResponse} from "next/server";
import {BNET_COOKIE_NAME, GUILD_REALM_SLUG} from "@/app/util/constants";
import WoWService from "@/app/services/wow-service";
import {fetchCharacterAvatar} from "@/app/lib/fetchCharacterAvatar";
import {getBlizzardToken} from "@/app/lib/getBlizzardToken";

export async function GET(request: NextRequest) {
    let token: any = (await cookies()).get(BNET_COOKIE_NAME)

    if (new URL(request.url).searchParams.get('temporal') === 'true') {
        const {token: _token} = await getBlizzardToken()
        token = {value: _token}
    }

    if (!token?.value) {
        return new NextResponse('Token is required', {
            status: 400
        })
    }

    const characterName = new URL(request.url).searchParams.get('name')

    if (!characterName) {
        return new NextResponse('Character name is required', {
            status: 400
        })
    }

    const wowService = new WoWService({token})
    const character = await wowService.fetchMemberInfo(characterName)
    if (!character) {
        return new NextResponse('Character not found', {
            status: 404
        })
    }

    const avatar = await fetchCharacterAvatar(token.value, GUILD_REALM_SLUG, characterName)

    return new NextResponse(JSON.stringify({...character, avatar}), {
        headers: {
            'content-type': 'application/json'
        }
    })
}
