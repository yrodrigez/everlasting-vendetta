
import {type SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {RaidParticipant} from "@/app/raid/api/types";

export async function fetchResetParticipants (supabase: SupabaseClient, resetId: string) {
    const {error, data} = await supabase
        .from('ev_raid_participant')
        .select('member:ev_member(id, character), is_confirmed, details, raid_id, created_at')
        .eq('raid_id', resetId)
        .returns<RaidParticipant[]>()

    if (error) {
        console.error('Error fetching participants', error)
        return []
    }

    return data ?? []
}
