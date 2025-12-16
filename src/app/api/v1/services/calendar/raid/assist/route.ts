import { registerOnRaid } from "@/app/lib/database/raid_resets/registerOnRaid";
import { fetchBattleNetWoWAccounts } from "@/app/lib/fetchBattleNetWoWaccounts";
import createServerSession from "@utils/supabase/createServerSession";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    const { id: raidId, currentCharacter, details } = await request.json()


    if (!raidId) {
        return NextResponse.json({ error: 'Error - raidId is mandatory!' })
    }

    const { getSupabase } = await createServerSession();

    const supabase = await getSupabase();
    const accessToken = await supabase.realtime?.accessToken?.()
    if (!accessToken) {
        return NextResponse.json({ error: 'Error - no access token!' }, {
            status: 401
        })
    }

    const {
        data: participants,
        error: errorOnRegister
    } = await registerOnRaid(currentCharacter.id, raidId, details, supabase)
    if (errorOnRegister) {

        if (errorOnRegister.code === '42501') {
            return NextResponse.json({ error: 'You are currently benched and cannot update your status.' }, {
                status: 403
            })
        }

        console.error('Error registering on raid', errorOnRegister)
        return NextResponse.json({ error: `Error registering on raid ${errorOnRegister.message}` }, {
            status: 500
        })
    }

    return NextResponse.json({
        participants
    })
}
