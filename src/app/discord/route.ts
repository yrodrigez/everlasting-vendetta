import { type NextRequest, NextResponse } from 'next/server'
import createServerSession from '@/util/supabase/createServerSession'

const DISCORD_INVITE_URL = 'https://discord.gg/fYw9WCNFDU'

function getClientIp(req: NextRequest): string | null {
    return (
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
        req.headers.get('x-real-ip')?.trim() ??
        req.headers.get('cf-connecting-ip')?.trim() ??
        null
    )
}

export async function GET(req: NextRequest) {
    try {
        const { getSupabase, auth } = await createServerSession()
        const supabase = await getSupabase()
        const session = await auth.getSession()

        await supabase.from('web_events').insert({
            event_name: 'discord_invite_clicked',
            event_type: 'navigation',
            user_id: session?.id ?? null,
            page_url: req.url,
            page_path: '/discord',
            referrer: req.headers.get('referer') ?? null,
            metadata: {},
            ip_address: getClientIp(req),
            user_agent: req.headers.get('user-agent') ?? null,
        })
    } catch (err) {
        console.error('[discord/route] Failed to track event:', err)
    }

    return NextResponse.redirect(DISCORD_INVITE_URL)
}
