import { SupabaseClient } from "@supabase/supabase-js";

export class LootHistoryRepository {
    constructor(private readonly supabase: SupabaseClient) { }
    async hasResetLootHistory(raidResetId: string) {
        const { data, error } = await this.supabase.from('ev_loot_history')
            .select('id')
            .eq('raid_id', raidResetId)
            .limit(1)
            .maybeSingle()

        if (error) {
            console.error('Error checking loot history:', error);
            return false;
        }

        return !!data;
    }
}