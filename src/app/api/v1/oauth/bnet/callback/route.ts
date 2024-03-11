import {type NextRequest, NextResponse} from "next/server";
import {cookies} from "next/headers";

const PRODUCTION = process.env.NODE_ENV === 'production'
const PRODUCTION_ORIGIN = 'https://www.everlastingvendetta.com/'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const requestURL = new URL(request.url)
    const code = requestURL.searchParams.get('code')
    const redirect = decodeURIComponent(requestURL.searchParams.get('redirectedFrom') || '')

    if (code) {
        cookies().set('bnetToken', code, {
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
            sameSite: 'lax',
            secure: PRODUCTION,
            httpOnly: true
        })
    }


    if (PRODUCTION) {
        return NextResponse.redirect(PRODUCTION_ORIGIN + redirect)
    }

    return NextResponse.redirect(requestURL.origin + redirect)
}
