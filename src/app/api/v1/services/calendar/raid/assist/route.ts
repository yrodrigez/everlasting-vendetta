import {NextRequest, NextResponse} from "next/server";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {fetchBattleNetWoWAccounts} from "@/app/lib/fetchBattleNetWoWaccounts";
import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";

async function registerOnRaid(characterId: string, raidId: string, details: any, supabase: any) {

    return supabase.from('ev_raid_participant')
        .upsert({
            raid_id: raidId,
            member_id: characterId,
            updated_at: new Date(),
            details: details,
            is_confirmed: details?.status === 'confirmed'
        })
        .eq('raid_id', raidId)
        .eq('member_id', characterId)
        .select('member:ev_member(*), is_confirmed, raid_id, details')
}

export async function POST(request: NextRequest) {
    const {id: raidId, currentCharacter, details} = await request.json()


    if (!raidId) {
        return NextResponse.json({error: 'Error - raidId is mandatory!'})
    }

    const token = cookies().get(process.env.BNET_COOKIE_NAME!)
    if (!token) {
        const origin = new URL(request.url).origin
        return redirect(origin + '/api/v1/oauth/bnet/auth')
    }

    const supabaseToken = cookies().get('evToken')
    if (!supabaseToken) {
        return NextResponse.json({error: 'Error - supabase token is mandatory!'})
    }
    const supabase = createServerComponentClient({cookies}, {
        options: {
            global: {
                headers: {
                    Authorization: `Bearer ${supabaseToken.value}`
                }
            }
        }
    })

    const currentUserCharacters = await fetchBattleNetWoWAccounts(token.value)
    if (!currentUserCharacters) {
        return NextResponse.json({error: 'Error fetching wow characters'})
    }

    const isCharacterOwned = currentUserCharacters.some((character: any) => {
        if (character.id === currentCharacter.id) {
            return true
        }
    })
    if (!isCharacterOwned) {
        return NextResponse.json({error: 'Error - character not owned!'})
    }

    const {
        data: participants,
        error: errorOnRegister
    } = await registerOnRaid(currentCharacter.id, raidId, details, supabase)
    if (errorOnRegister) {
        console.error('Error registering on raid', errorOnRegister)
        return NextResponse.json({error: 'Error registering on raid'})
    }

    return NextResponse.json({
        participants
    })
}
