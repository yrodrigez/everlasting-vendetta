import {NextRequest, NextResponse} from 'next/server';
import moment from "moment";
import {cookies} from "next/headers";
import {getLoggedInUserFromAccessToken} from "@utils/supabase/createServerSession";
import {createServerComponentClient} from "@utils/supabase/createServerComponentClient";

async function isBanned() {

    const supabaseToken = cookies().get('evToken')?.value;

    if (!supabaseToken) {
        return false;
    }
    const session = getLoggedInUserFromAccessToken(supabaseToken);
    if (!session || !session.id) {
        return false;
    }

    const supabase = createServerComponentClient({supabaseToken});
    const {
        data: banned,
        error
    } = await supabase.from('banned_member').select('id').eq('member_id', session.id).single();

    if (error) {
        return false;
    }

    return !!banned;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpe?g|gif|webp|svg|mp4)).*)'
    ]
}


export async function middleware(req: NextRequest) {
    const url = req.nextUrl;

    if (await isBanned() && url.pathname !== '/banned') {
        return NextResponse.redirect(`${url.origin}/banned`);
    }


    if (url.pathname === '/calendar') {
        if (!url.searchParams.has('d')) {
            // Set the default 'd' query parameter to the current date
            url.searchParams.set('d', moment().format('YYYY-MM-DD'));


            return NextResponse.redirect(url);
        }
    }


    return NextResponse.next();
}
