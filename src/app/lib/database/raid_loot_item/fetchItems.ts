import {type SupabaseClient} from "@supabase/supabase-js";

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
    const {data: items, error} = await supabase.from('raid_loot')
        .select('item:raid_loot_item(*), raid:ev_raid(name, id, min_level)')
        .eq('raid_id', raidId)
        .eq('is_visible', true)
        .returns<{
            item: {
                id: number,
                name: string,
                created_at: string,
                updated_at: string,
                raid_id: string,
                description: {
                    icon: string,
                    name: string,
                    quality: number,
                    tooltip: string,
                    itemClass: number,
                    itemSubClass: number,
                    inventoryType: number,
                },
            }
            raid: {
                name: string,
                id: string,
                min_level: number,
            }
        }[]>()

    if (error) {
        throw new Error(error.message)
    }

    return items?.map((item) => {
        return {
            ...item.item,
            raid: item.raid
        }
    })
}
