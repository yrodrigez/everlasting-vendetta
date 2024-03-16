import {createClient} from "@supabase/supabase-js";
import {NextRequest, NextResponse} from "next/server";

async function fetchRaidStatus(raidId: any) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const {
        data,
        error
    } = await supabase.from('ev_raid_participant').select('member:ev_member(*), is_confirmed, raid_id').eq('raid_id', raidId)
    return {data, error}
}

export async function GET(request: NextRequest) {
    const raidId = new URL(request.url).searchParams.get('id') || ''
    if (!raidId) {
        NextResponse.json({error: 'Error - raidId is mandatory!'},)
    }
    const {data, error} = await fetchRaidStatus(raidId)
    if (error) {
        return NextResponse.json({error: 'Error fetching raid status: ' + error})
    }

    return NextResponse.json(data)
}
