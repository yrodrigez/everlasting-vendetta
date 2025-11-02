import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchBattleNetWoWAccounts } from "@/app/lib/fetchBattleNetWoWaccounts";
import { registerOnRaid } from "@/app/lib/database/raid_resets/registerOnRaid";
import createServerSession from "@utils/supabase/createServerSession";


export async function POST(request: NextRequest) {
    const { id: raidId, currentCharacter, details } = await request.json()


    if (!raidId) {
        return NextResponse.json({ error: 'Error - raidId is mandatory!' })
    }

    const authorization = request.headers.get('authorization')?.split(' ').pop()
    if (!authorization) {
        const origin = new URL(request.url).origin
        return redirect(origin + '/api/v1/oauth/bnet/auth')
    }

    const { getSupabase } = await createServerSession();
    const supabase = await getSupabase();
    if (!currentCharacter.isTemporal) {
        const currentUserCharacters = await fetchBattleNetWoWAccounts(authorization)
        if (!currentUserCharacters) {
            return NextResponse.json({ error: 'Error fetching wow characters' }, {
                status: 500
            })
        }

        const isCharacterOwned = currentUserCharacters.some((character: any) => {
            if (character.id === currentCharacter.id) {
                return true
            }
        })
        if (!isCharacterOwned) {
            return NextResponse.json({ error: 'Error - character not owned!' }, {
                status: 403
            })
        }
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
