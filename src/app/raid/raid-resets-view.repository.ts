import { type SupabaseClient } from "@supabase/supabase-js";

const RAID_RESETS_COLUMNS = 'raid_date, id, raid:ev_raid(name, min_level, image, min_gs, size), time, end_date, end_time, status, realm, is_reservations_allowed, created_by, raid_id'

export type RaidResetView = {
    raid_date: string
    id: string
    raid: { name: string; min_level: number; image: string; min_gs: number; size: number }
    time: string
    end_date: string
    end_time: string
    status: 'online' | 'offline' | 'locked' | 'offline'
    realm: string
    is_reservations_allowed: boolean
    created_by: number
    raid_id: string
}

function currentDate() {
    return new Date().toISOString().split('T')[0];
}

export class RaidResetsViewRepository {
    constructor(private readonly supabase: SupabaseClient) { }

    findNext() {
        const nextWednesday = new Date();
        nextWednesday.setDate(nextWednesday.getDate() + ((3 - nextWednesday.getDay() + 7) % 7));
        return this.supabase.from('raid_resets')
            .select(RAID_RESETS_COLUMNS)
            .gte('end_date', currentDate())
            .gte('raid_date', nextWednesday.toISOString().split('T')[0])
            .order('raid_date', { ascending: true })
            .maybeSingle()
            .overrideTypes<RaidResetView>()
    }

    findResetsCurrentResetsFromSameRaid(raid_id: string, reset_id: string) {
        return this.supabase.from('raid_resets')
            .select('id, raid_date, raid_time:time, raid_id')
            .eq('raid_id', raid_id)
            .neq('id', reset_id)
            .gte('raid_date', currentDate())
    }


    findCurrent() {
        return this.supabase.from('raid_resets')
            .select(RAID_RESETS_COLUMNS)
            .gte('end_date', currentDate())
            .order('raid_date', { ascending: true })
            .limit(1)
            .maybeSingle()
            .overrideTypes<RaidResetView>()
    }

    async findById(id: string) {
        const { data, error } = await this.supabase.rpc('reset_id_starts_with', { id_prefix: `${id}%` })

        if (error) {
            return { error }
        }

        if (!data || data.length === 0) {
            return { error: new Error('No reset found with id starting with ' + id) }
        }

        const fullId = data[0].id;

        const { data: raidReset, error: fetchError } = await this.supabase.from('raid_resets')
            .select(RAID_RESETS_COLUMNS)
            .eq('id', fullId)
            .maybeSingle()
            .overrideTypes<RaidResetView>()

        if (fetchError) {
            return { error: fetchError }
        }

        if (!raidReset) {
            return { error: new Error('No reset found with id ' + fullId) }
        }

        return { data: raidReset }
    }

    async findCurrentResetsFromSameRaid(raid_date: string, raid_id: number, reset_id: string) {
        const { data, error } = await this.supabase.from('raid_resets')
            .select('id, raid_date, raid_id')
            .eq('raid_date', raid_date)
            .eq('raid_id', raid_id)
            .neq('id', reset_id)
            .overrideTypes<RaidResetView[]>()

        if (error) {
            return { error }
        }

        return { data }
    }

    async findPreviousAndNext(raid_date: string) {
        return Promise.all([
            this.supabase.from('raid_resets')
                .select('id')
                .lt('raid_date', raid_date)
                .gte('raid_date', '2024-03-21')
                .order('raid_date', { ascending: false })
                .limit(1)
                .maybeSingle()
                .overrideTypes<{ id: string } | null>(),
            this.supabase.from('raid_resets')
                .select('id')
                .gt('raid_date', raid_date)
                .order('raid_date', { ascending: true })
                .limit(1)
                .maybeSingle()
                .overrideTypes<{ id: string } | null>()
        ])
    }


}