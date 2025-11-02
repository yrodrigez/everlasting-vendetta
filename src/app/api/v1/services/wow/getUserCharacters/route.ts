import { NextRequest, NextResponse } from "next/server";
import { getRealmCharacters } from "@/app/util/blizzard/battleNetWoWAccount";
import createServerSession from "@utils/supabase/createServerSession";


export async function GET(request: NextRequest) {
    const authorizationHeader = request.headers.get('authorization') || ''
    const token = authorizationHeader?.replace('Bearer ', '')
    const { auth } = await createServerSession();
    const user = await auth.getSession()

    if (user && user.isTemporal) {
        return NextResponse.json({ characters: [user] })
    }

    const requestUrl = new URL(request.url)
    if (!token) return NextResponse.redirect(requestUrl.origin + '/api/v1/oauth/bnet/auth')

    try {
        const characters = await getRealmCharacters({ token }) ?? []
        return NextResponse.json({ characters })
    } catch (e) {
        console.error('Error fetching realm characters', e)
        return NextResponse.error()
    }
}
