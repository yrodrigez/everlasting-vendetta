import { NextResponse, type NextRequest } from "next/server";
import { redirect } from "next/navigation";
import createServerSession from "@utils/supabase/createServerSession";
import { SupabaseClient } from "@supabase/supabase-js";

async function registerOnRaid(supabase: SupabaseClient, characterId: string, raidId: string, isConfirmed: boolean = false) {
    const { data, error } = await supabase.from('ev_raid_participant').upsert({
        raid_id: raidId,
        member_id: characterId,
        updated_at: new Date(),
        is_confirmed: isConfirmed
    }).select('member:ev_member(*), is_confirmed, raid_id')

    return { data, error }
}

export async function POST(request: NextRequest) {
    const { id: raidId, currentCharacter, isConfirmed } = await request.json()
    if (!raidId) {
        return NextResponse.json({ error: 'Error - raidId is mandatory!' })
    }

    const token = request.headers.get('authorization')?.replace('Bearer ', '') || ''
    if (!token) {
        const origin = new URL(request.url).origin
        return redirect(origin + '/api/v1/oauth/bnet/auth')
    }

    const { getSupabase } = await createServerSession();
    const supabase = await getSupabase();
    const {
        data: participants,
        error: errorOnRegister
    } = await registerOnRaid(supabase, currentCharacter.id, raidId, !!isConfirmed)
    if (errorOnRegister) {
        return NextResponse.json({ error: 'Error registering on raid' })
    }

    return NextResponse.json({
        participants
    })
}
