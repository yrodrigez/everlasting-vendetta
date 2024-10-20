import {cookies} from "next/headers";
import {NextRequest, NextResponse} from "next/server";
import {getRealmCharacters} from "@/app/util/blizzard/battleNetWoWAccount";
import {BNET_COOKIE_NAME} from "@/app/util/constants";
import createServerSession from "@utils/supabase/createServerSession";


export async function GET(request: NextRequest) {
    const token = cookies().get(BNET_COOKIE_NAME)
    const {auth} = createServerSession({cookies})
    const user = await auth.getSession()
    if (!user) return NextResponse.redirect('/api/v1/oauth/bnet/auth')

    if (user.isTemporal) {
        return NextResponse.json({characters: [user]})
    }

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
