import {type SupabaseClient} from "@supabase/supabase-js";
import type {Day} from "@/app/calendar/new/Components/useCreateRaidStore";

export default async function getResetById(id: string, supabase: SupabaseClient) {
    if (!id) {
        throw new Error('id is required');
    }

    const {data, error} = await supabase.from('raid_resets')
        .select('*, raid:ev_raid(id, name, min_level, image, reservation_amount)')
        .eq('id', id)
        .single<{
            id: string;
            raid_date: string;
            raid_id: string;
            days: Day[];
            raid: { id: string, name: string, min_level: number, image: string, reservation_amount: number };
            time: string;
            end_date: string;
            end_time: string;
            name: string;
            realm: string;
        }>();

    if (error) {
        throw new Error('Error fetching raid reset' + JSON.stringify(error));
    }

    return data;
}
