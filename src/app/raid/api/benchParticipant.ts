import {type SupabaseClient} from "@supabase/supabase-js";
import {RAID_STATUS} from "@/app/raid/components/utils";

export default async function benchParticipant(supabase: SupabaseClient, resetId: string, memberId: number, bench: boolean, details: {
    role: string,
    status: string
}) {

    const {data, error} = await supabase
        .from("ev_raid_participant")
        .update({
            details: {
                ...details,
                status: bench ? RAID_STATUS.BENCH : RAID_STATUS.CONFIRMED
            },
            is_confirmed: !bench,
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString()
        })
        .eq("raid_id", resetId)
        .eq("member_id", memberId)
        .select('member_id')
        .single();
        
    if (error) {
        console.error(error);
        return null;
    }

    const {error: reservationError} = await supabase
        .from('raid_loot_reservation')
        .update({
            status: bench ? RAID_STATUS.BENCH : 'reserved'
        })
        .eq('reset_id', resetId)
        .eq('member_id', memberId)

    if (reservationError) {
        console.error(reservationError);
        return null
    }


    return data;
}
