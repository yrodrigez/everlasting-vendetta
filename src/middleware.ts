import {NextRequest, NextResponse} from 'next/server';
import moment from "moment";
import {cookies} from "next/headers";
import createServerSession, {getLoggedInUserFromAccessToken} from "@utils/supabase/createServerSession";
import {createServerComponentClient} from "@utils/supabase/createServerComponentClient";

async function isBanned() {

    const supabaseToken = (await cookies()).get('evToken')?.value;

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

async function registerClick(urlId: string) {
    const {supabase} = await createServerSession({cookies})
    const {data, error: urlError} = await supabase
        .schema('open_campaign')
        .from('urls')
        .select('id, url')
        .eq('id', urlId)
        .single();

    if (urlError) {
        console.error('Error fetching URL:', urlError);
        return;
    }

    const {error} = await supabase
        .schema('open_campaign')
        .from('clicks')
        .insert({
        url_id: urlId,
        created_at: new Date().toISOString(),
    });

    if (error) {
        console.error('Error inserting click:', error);
        return;
    }

    return NextResponse.redirect(data.url);

}


export async function middleware(req: NextRequest) {
    const url = req.nextUrl;

    if(url.pathname.startsWith('/r/')) {
        const urlId = url.pathname.split('/')[2];
        return await registerClick(urlId);
    }

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
