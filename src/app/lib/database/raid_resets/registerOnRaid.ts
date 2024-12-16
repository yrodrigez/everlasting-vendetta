import {Day} from "@/app/calendar/new/Components/useCreateRaidStore";
import {MemberRole} from "@/app/types/Member";

export async function registerOnRaid(characterId: string | number, raidId: string, details: {
                                  "days": Day[],
                                  "role": MemberRole,
                                  "status": 'confirmed' | 'declined' | 'late' | 'tentative',
                                  "className": 'warrior' | 'paladin' | 'hunter' | 'rogue' | 'priest' | 'shaman' | 'mage' | 'warlock' | 'druid'
                              }
    , supabase: any) {

    let wasDeclined = false
    if (details?.status !== 'declined') {
        const {data: declinedParticipants, error} = await supabase.from('ev_raid_participant')
            .select('member_id')
            .eq('raid_id', raidId)
            .eq('details->>status', 'declined')
            .eq('member_id', characterId)
            .single()

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching declined participants', error)
            return {error}
        }
        if (declinedParticipants) {
            wasDeclined = true
        }
    }

    return supabase.from('ev_raid_participant')
        .upsert({
            raid_id: raidId,
            member_id: characterId,
            updated_at: new Date(),
            details: details,
            is_confirmed: details?.status === 'confirmed',
            ...(wasDeclined ? {created_at: new Date()} : {})
        })
        .eq('raid_id', raidId)
        .eq('member_id', characterId)
        .select('member:ev_member(*), is_confirmed, raid_id, details')
}
