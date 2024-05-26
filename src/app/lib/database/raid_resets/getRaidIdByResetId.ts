import type {SupabaseClient} from "@supabase/auth-helpers-nextjs";

/**
 * Get the raid_id for a given reset_id
 *
 * @param supabase {SupabaseClient} Supabase client
 * @param resetId {string} The reset_id to get the raid_id for
 * @returns {Promise<string | undefined>} The raid_id for the given reset_id or undefined if not found
 */
export async function getRaidIdByResetId(supabase: SupabaseClient, resetId: string): Promise<string | undefined> {
    const {data, error} = await supabase
        .from('raid_resets')
        .select('raid_id')
        .eq('id', resetId)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw new Error(`Error fetching raid_id: ${error.message}`);
    }

    return data?.raid_id;
}
