import {type SupabaseClient} from "@supabase/auth-helpers-nextjs";

export default async function getAvailableRaids(supabase: SupabaseClient) {
    const {data: raids, error: raidsError} = await supabase.from('ev_raid')
        .select('*')
        .order('min_level', {ascending: false})
        .order('created_at', {ascending: false})
        .returns<{
            id: string,
            name: string,
            min_level: number,
            image: string,
            reservation_amount: number,
        }[]>()

    if (raidsError) {
        throw new Error('Error fetching raids: ' + JSON.stringify(raidsError));
    }

    return raids;
}
