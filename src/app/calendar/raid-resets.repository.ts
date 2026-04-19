import { SupabaseClient } from "@supabase/supabase-js";

export type RaidResetRow = {
    raid_date: string
    id: string
    raid: { name: string; min_level: number; image: string; size: number }
    time: string
    end_date: string
    modifiedBy: { character: { name: string } }
    modified_at: string
    end_time: string
    status?: 'online' | 'offline'
    createdBy: { character: { name: string } }
}

export default class RaidResetsRepository {
    private readonly raidResetColumns = 'raid_date, id, raid:ev_raid(name, min_level, image, size), time, end_date, modifiedBy:ev_member!modified_by(character), modified_at, end_time, status, createdBy:ev_member!created_by(character)'
    constructor(private readonly supabase: SupabaseClient) { }

    async getRecentAndFutureRaids(safeCutoff: string): Promise<{ recentRaids: RaidResetRow[], oldExpiredCount: number, error: Error | null }> {
        const [recentResult, oldExpiredCountResult] = await Promise.all([
            this.supabase
                .from('raid_resets')
                .select(this.raidResetColumns)
                .gte('raid_date', safeCutoff)
                .order('raid_date', { ascending: true })
                .order('raid_id', { ascending: true })
                .overrideTypes<RaidResetRow[], { merge: false }>(),
            this.supabase
                .from('raid_resets')
                .select('*', { count: 'exact', head: true })
                .lt('raid_date', safeCutoff),
        ])

        if (recentResult.error || oldExpiredCountResult.error) {
            console.error('[RaidResetsRepository] Error fetching recent raids: ' + JSON.stringify(recentResult.error || oldExpiredCountResult.error))
            return { recentRaids: [] as RaidResetRow[], oldExpiredCount: 0, error: recentResult.error || oldExpiredCountResult.error }
        }

        return {
            recentRaids: recentResult.data || [] as RaidResetRow[],
            oldExpiredCount: oldExpiredCountResult.count || 0,
            error: null,
        }
    }

    async getRaidsInRange(safeCutoff: string, { start, end }: { start: number, end: number }) {
        const { data, error } = await this.supabase
            .from('raid_resets')
            .select(this.raidResetColumns)
            .lt('raid_date', safeCutoff)
            .order('raid_date', { ascending: false })
            .order('raid_id', { ascending: false })
            .range(start, end)
            .overrideTypes<RaidResetRow[], { merge: false }>()

        if (error) {
            console.error('[RaidResetsRepository] Error fetching past raids: ' + JSON.stringify(error))
        }

        return { data, error }
    }
}