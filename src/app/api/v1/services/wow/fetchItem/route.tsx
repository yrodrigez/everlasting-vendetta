import axios from "axios";
import { type NextRequest, NextResponse } from "next/server";
import { type SupabaseClient } from "@supabase/supabase-js";
import { getItemDisplayId } from "@/app/util/wowhead/getItemDisplayId";
import { createBlizzardItemFetchUrl } from "@/app/util/constants";
import createServerSession from "@utils/supabase/createServerSession";
import { getBlizzardToken } from "@/app/lib/getBlizzardToken";
import { getInventoryType } from "@/app/api/v1/services/wow/fetchItem/getInventoryType";

function knownItemLevelQuality(itemId: number) {
    const knownItemLevels = {
        215161: 45,
        210781: 30,
        211450: 33,
        215111: 45,
        999999: 0,
        0: 0,
        216494: 45,
        213409: 45,
        213350: 45,

    } as any
    return knownItemLevels[itemId] ?? 0;

}

async function fetchItemDetails(token: string, itemId: number) {
    if (!token) {
        console.error('No token provided for fetching item details')
        throw new Error('No token provided for fetching item details')
    }
    const url = createBlizzardItemFetchUrl(itemId);
    let itemDetails = { quality: {}, level: knownItemLevelQuality(itemId) } as any;

    try {
        const { data } = await axios.get(`${url}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        })

        itemDetails = data;
    } catch (e) {
        console.error('Error fetching item details:', itemId, e)
        console.error('try this in postman', url, 'with token', token)
        return {}
    }
    if (itemDetails.quality.level === 0) {
        console.error('Item quality not found for item:', itemId)
    }
    return itemDetails;
}

async function fetchWoWHeadItem(itemId: number) {
    const url = `https://nether.wowhead.com/tooltip/item/${itemId}?dataEnv=4&locale=0`
    const response = await fetch(url)
    const data = await response.json() as {
        icon: string,
        quality: number,
        name: string,
        id: number,
        tooltip: string
        spells: any[]
    }

    const qualityName = [
        'poor',
        'common',
        'uncommon',
        'rare',
        'epic',
        'legendary',
        'artifact',
        'heirloom',
    ][data.quality ?? 0]
    const itemLevel = (() => {
        if (!data.tooltip || typeof data?.tooltip !== 'string') {
            return [0, 0]
        }

        return data.tooltip?.match(/Item\s*Level\s*(?:<!--ilvl-->)?\s*(\d+)/i) ?? [0, 0]
    })()
    return {
        icon: `https://wow.zamimg.com/images/wow/icons/medium/${data.icon}.jpg`,
        qualityName: qualityName,
        name: data.name,
        id: itemId,
        tooltip: data.tooltip,
        spells: data.spells,
        level: itemLevel ? parseInt(itemLevel[1] as string) : 0,
        quality: {
            type: qualityName.toUpperCase(),
            name: (qualityName[0].toUpperCase() + qualityName.slice(1)),
        },
        type: getInventoryType(data.tooltip),
    }
}

async function getItemFromDatabase(supabase: SupabaseClient, itemId: number) {
    const { data, error } = await supabase.from('wow_items')
        .select('*')
        .eq('id', itemId)
        .limit(1)
        .single()

    if (error) {
        console.error('Error fetching item from database:', error)
        return null
    }

    if (!data?.details) {
        return null
    }

    return { details: data.details, lastUpdated: data.updated_at, displayId: data.displayId, id: data.id }
}

async function saveItemToDatabase(supabase: SupabaseClient, itemId: number, itemDetails: any, displayId: number) {
    const { data, error } = await supabase.from('wow_items')
        .upsert({ id: itemId, details: itemDetails, display_id: displayId, updated_at: new Date() }).select('details')
        .limit(1)
        .single()
    if (error) {
        console.error('Error saving item to database:', error)
        return null
    }

    return data
}

async function fetchNewItem(supabase: SupabaseClient, token: { value: string, name: string }, itemId: number) {
    const [wowHeadItem, bnetDetails, displayId] = await Promise.all([
        fetchWoWHeadItem(itemId),
        fetchItemDetails(token?.value, itemId),
        getItemDisplayId(itemId).catch(() => 0)
    ])

    const itemDetails = {
        ...wowHeadItem,
        ...bnetDetails,
        icon: wowHeadItem.icon,
    }

    saveItemToDatabase(supabase, itemId, itemDetails, displayId).then() // Don't wait for this to finish
    const itemIconUrl = itemDetails.icon
    return NextResponse.json({ itemIconUrl, itemDetails, displayId })
}

export async function GET(request: NextRequest) {
    const url = new URL(request.url)
    const itemId = Number(url.searchParams.get('itemId'))
    const force = url.searchParams.get('force') === 'true'

    const { getSupabase } = await createServerSession();
    const supabase = await getSupabase();


    const data = await getBlizzardToken()


    if (itemId === 999999) {
        return NextResponse.json({
            itemIconUrl: 'https://wow.zamimg.com/images/wow/icons/medium/inventoryslot_empty.jpg',
            itemDetails: {}
        })
    }

    if (force) {
        return fetchNewItem(supabase, data.token, itemId)
    }

    const itemFromDatabase = await getItemFromDatabase(supabase, itemId)
    const itemDetailsFromDatabase = itemFromDatabase?.details
    const lastUpdated = itemFromDatabase?.lastUpdated
    const displayId = itemFromDatabase?.displayId
    const isStale = ((new Date().getTime() - new Date(lastUpdated).getTime()) < 1000 * 60 * 60 * 24 * 60)

    if ((itemDetailsFromDatabase && lastUpdated && isStale)) { // If item is in database and was updated less than 2 months ago
        const itemIconUrl = itemDetailsFromDatabase.icon
        const itemDetails = itemDetailsFromDatabase;

        return NextResponse.json({ itemIconUrl, itemDetails, displayId })
    }

    return fetchNewItem(supabase, data.token, itemId)
}
