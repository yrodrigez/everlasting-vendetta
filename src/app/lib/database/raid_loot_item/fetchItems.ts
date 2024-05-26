import {type SupabaseClient} from "@supabase/auth-helpers-nextjs";

/**
 * Fetches all items for a raid from the database and returns them as an array
 *
 * @param supabase {SupabaseClient} Supabase client
 * @param raidId {string} The id of the raid to fetch items for
 * @returns {Promise<{id: number, name: string, created_at: string, updated_at: string, raid_id: string, description: string, raid: {name: string, id: string, min_level: number}}>} The items for the raid
 * @throws {Error} If an error occurs
 * @example
 */
export async function fetchItems(supabase: SupabaseClient, raidId: string): Promise<{
    id: number
    name: string
    created_at: string
    updated_at: string
    raid_id: string
    description: {
        icon: string
        name: string
        quality: number
        tooltip: string
        itemClass: number
        itemSubClass: number
        inventoryType: number
    }
    raid: {
        name: string
        id: string
        min_level: number
    }
}[]> {
    const {data: items, error} = await supabase.from('raid_loot_item')
        .select('*, raid:ev_raid(name, id, min_level)')
        .eq('raid_id', raidId)

    if (error) {
        throw new Error(error.message)
    }

    return items?.map((item: any) => {
        return {
            id: item.id as number,
            name: item.name as string,
            created_at: item.created_at as string,
            updated_at: item.updated_at as string,
            raid_id: item.raid_id as string,
            description: item.description as { icon: string, itemClass: number, itemSubClass: number, inventoryType: number, name: string, quality: number, tooltip: string},
            raid: {
                name: item.raid?.name ?? '' as string,
                id: item.raid?.id ?? '' as string,
                min_level: item.raid?.min_level ?? 0 as number
            }
        }
    })
}
