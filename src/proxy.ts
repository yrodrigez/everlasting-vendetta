
import createServerSession, { type UserProfile } from "@utils/supabase/createServerSession";
import type { SupabaseClient } from '@supabase/supabase-js';
import { withRefreshToken } from '@/app/lib/middleware/with-auth';
import { NextRequest, NextResponse } from 'next/server';

async function isBanned(session: UserProfile | undefined, supabase?: SupabaseClient) {

    if (!supabase) {
        return false;
    }

    if (!session?.id) {
        return false;
    }

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
    //runtime: 'nodejs',
    matcher: [
        '/((?!api/v1/auth/refresh|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpe?g|gif|webp|svg|mp4)).*)'
    ]
}

async function registerClick(urlId: string, supabase: SupabaseClient) {
    const { data, error: urlError } = await supabase
        .schema('open_campaign')
        .from('urls')
        .select('id, url')
        .eq('id', urlId)
        .single();

    if (urlError) {
        console.error('Error fetching URL:', urlError);
        return;
    }

    const { error } = await supabase
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


async function proxy(req: NextRequest, res: NextResponse): Promise<NextResponse> {
    const { getSupabase, auth } = await createServerSession();

    const url = req.nextUrl;

    if (url.pathname.startsWith('/r/')) {
        const urlId = url.pathname.split('/')[2];
        const redirect = await registerClick(urlId, (await getSupabase()));
        if (redirect) {
            return redirect;
        }
    }

    const session = await auth.getSession();
    if (await isBanned(session, (await getSupabase())) && url.pathname !== '/banned') {
        return NextResponse.redirect(`${url.origin}/banned`);
    }

    return res;
}

export default withRefreshToken(proxy);
