import { NextRequest, NextResponse } from "next/server";
import createServerSession from "@utils/supabase/createServerSession";

export async function GET(request: NextRequest) {
    const raidId = new URL(request.url).searchParams.get('id') || ''
    if (!raidId) {
        NextResponse.json({ error: 'Error - raidId is mandatory!' },)
    }

    const token = request.headers.get('authorization')?.replace('Bearer ', '') || ''
    const { getSupabase } = await createServerSession();
    const supabase = await getSupabase();
    const {
        data,
        error
    } = await supabase.from('ev_raid_participant').select('member:ev_member(*), is_confirmed, raid_id, details').eq('raid_id', raidId)


    if (error) {
        return NextResponse.json({ error: 'Error fetching raid status: ' + error })
    }

    return NextResponse.json(data)
}
