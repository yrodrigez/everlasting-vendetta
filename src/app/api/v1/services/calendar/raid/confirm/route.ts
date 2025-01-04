import {cookies} from "next/headers";
import {NextResponse, type NextRequest} from "next/server";
import {fetchCharacterAvatar} from "@/app/lib/fetchCharacterAvatar";
import {fetchGuildInfo} from "@/app/lib/fetchGuildInfo";
import {fetchBattleNetWoWAccounts} from "@/app/lib/fetchBattleNetWoWaccounts";
import {redirect} from "next/navigation";
import createServerSession from "@utils/supabase/createServerSession";

async function registerOnRaid(characterId: string, raidId: string, isConfirmed: boolean = false) {
    const {supabase} = await createServerSession({cookies})
    const {data, error} = await supabase.from('ev_raid_participant').upsert({
        raid_id: raidId,
        member_id: characterId,
        updated_at: new Date(),
        is_confirmed: isConfirmed
    }).select('member:ev_member(*), is_confirmed, raid_id')

    return {data, error}
}


async function insertOrUpdateRaidParticipant(token: string, character: any) {
    const avatar = await fetchCharacterAvatar(token, character.realm.slug, character.name)

    const {supabase} = await createServerSession({cookies})
    const {data, error} = await supabase.from('ev_member').upsert({
        id: character.id,
        character: {
            ...character,
            avatar
        },
        updated_at: new Date()
    }).select('*').single()

    return {data, error}
}

export async function POST(request: NextRequest) {
    const {id: raidId, currentCharacter, isConfirmed} = await request.json()
    if (!raidId) {
        return NextResponse.json({error: 'Error - raidId is mandatory!'})
    }

    const token = (await cookies()).get(process.env.BNET_COOKIE_NAME!)
    if (!token) {
        const origin = new URL(request.url).origin
        return redirect(origin + '/api/v1/oauth/bnet/auth')
    }

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

    const guild = await fetchGuildInfo(token.value)
    if (!guild) {
        return NextResponse.json({error: 'Error fetching guild roster'})
    }
    const currentRoster = guild.members
    const isCharacterInRoster = currentRoster.some((character: any) => {
        if (character.character.id === currentCharacter.id) {
            return true
        }
    })

    if (!isCharacterInRoster) {
        return NextResponse.json({error: 'Error - character not in roster!'})
    }
    const {data: participant, error} = await insertOrUpdateRaidParticipant(token.value, currentCharacter)
    if (error) {
        return NextResponse.json({error: 'Error inserting or updating raid participant'})
    }

    const {
        data: participants,
        error: errorOnRegister
    } = await registerOnRaid(currentCharacter.id, raidId, !!isConfirmed)
    if (errorOnRegister) {
        return NextResponse.json({error: 'Error registering on raid'})
    }

    return NextResponse.json({
        participants
    })
}
