import { MemberRole } from "@/types/Member";
import { type SupabaseClient } from "@supabase/supabase-js";

export async function registerOnRaid(userId: string, characterId: string | number, raidId: string, details: {
    "role": MemberRole,
    "status": 'confirmed' | 'declined' | 'late' | 'tentative',
    "className": 'warrior' | 'paladin' | 'hunter' | 'rogue' | 'priest' | 'shaman' | 'mage' | 'warlock' | 'druid'
}, supabase: SupabaseClient) {

    let wasDeclined = false
    if (details?.status !== 'declined') {
        const { data: declinedParticipants, error } = await supabase.from('ev_raid_participant')
            .select('member_id')
            .eq('raid_id', raidId)
            .eq('details->>status', 'declined')
            .eq('member_id', characterId)
            .single()

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching declined participants', error)
            return { error, data: null }
        }
        if (declinedParticipants) {
            wasDeclined = true
        }
    }

    const { data: existsParticipantsSameUserId, error } = await supabase.from('ev_raid_participant')
        .select('member_id, character:ev_member!inner(user_id)')
        .eq('raid_id', raidId)
        .neq('details->>status', 'declined')
        .eq('character.user_id', userId)
        .neq('member_id', characterId)
        .overrideTypes<{ member_id: string, character: { user_id: string } }[]>()

    if (error) {
        console.error('Error fetching participants with same user id', error)
        return { error, data: null }
    }

    if (existsParticipantsSameUserId && existsParticipantsSameUserId.length > 0) {
        console.warn('User is trying to register multiple characters for the same raid', { userId, raidId, existingCharacters: existsParticipantsSameUserId })
        return { error: { code: '403', message: 'You have already registered another character for this raid' }, data: null }
    }


    return supabase.from('ev_raid_participant')
        .upsert({
            raid_id: raidId,
            member_id: characterId,
            updated_at: new Date(),
            details: details,
            is_confirmed: details?.status === 'confirmed',
            ...(wasDeclined ? { created_at: new Date() } : {})
        })
        .eq('raid_id', raidId)
        .eq('member_id', characterId)
        .select('member:ev_member(*), is_confirmed, raid_id, details')
}
