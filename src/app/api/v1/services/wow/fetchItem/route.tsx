import axios from "axios";
import {cookies} from "next/headers";
import {type NextRequest, NextResponse} from "next/server";
import {type SupabaseClient} from "@supabase/supabase-js";
import {getItemDisplayId} from "@/app/util/wowhead/getItemDisplayId";
import {BNET_COOKIE_NAME, createBlizzardItemFetchUrl} from "@/app/util/constants";
import createServerSession from "@utils/supabase/createServerSession";

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
    const url = createBlizzardItemFetchUrl(itemId);
    let itemDetails = {quality: {}, level: knownItemLevelQuality(itemId)} as any;

    try {
        const {data} = await axios.get(`${url}`, {
            headers: {'Authorization': 'Bearer ' + token}
        })
        itemDetails = data;
    } catch (e) {
        //console.error('Error fetching item details:', e)
        return itemDetails
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

    return {
        icon: `https://wow.zamimg.com/images/wow/icons/medium/${data.icon}.jpg`,
        quality: data.quality,
        qualityName: qualityName,
        name: data.name,
        id: data.id,
        tooltip: data.tooltip,
        spells: data.spells
    }
}

async function getItemFromDatabase(supabase: SupabaseClient, itemId: number) {
    const {data, error} = await supabase.from('wow_items')
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

    return {details: data.details, lastUpdated: data.updated_at, displayId: data.displayId, id: data.id}
}

async function saveItemToDatabase(supabase: SupabaseClient, itemId: number, itemDetails: any, displayId: number) {
    const {data, error} = await supabase.from('wow_items')
        .upsert({id: itemId, details: itemDetails, display_id: displayId, updated_at: new Date()}).select('details')
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
        ...bnetDetails,
        ...wowHeadItem,
        icon: wowHeadItem.icon,
    }

    saveItemToDatabase(supabase, itemId, itemDetails, displayId).then() // Don't wait for this to finish
    const itemIconUrl = itemDetails.icon
    return NextResponse.json({itemIconUrl, itemDetails, displayId})
}

export async function GET(request: NextRequest) {
    const cookieList = cookies()
    let token = cookieList.get(BNET_COOKIE_NAME)
    const url = new URL(request.url)
    const itemId = Number(url.searchParams.get('itemId'))
    if (!token?.value) {
        token = {value: url.searchParams.get('token') ?? '', name: BNET_COOKIE_NAME}
    }

    if (itemId === 999999) {
        return NextResponse.json({
            itemIconUrl: 'https://wow.zamimg.com/images/wow/icons/medium/inventoryslot_empty.jpg',
            itemDetails: {}
        })
    }

    const {supabase} = createServerSession({cookies})
    const itemFromDatabase = await getItemFromDatabase(supabase, itemId)
    const itemDetailsFromDatabase = itemFromDatabase?.details
    const lastUpdated = itemFromDatabase?.lastUpdated
    const displayId = itemFromDatabase?.displayId
    const updatedLessThanAWeekAgo = ((new Date().getTime() - new Date(lastUpdated).getTime()) < 1000 * 60 * 60 * 24 * 7)

    if ((itemDetailsFromDatabase && lastUpdated && updatedLessThanAWeekAgo) && (displayId || displayId === 0)) { // If item is in database and was updated less than a week ago
        const itemIconUrl = itemDetailsFromDatabase.icon
        const itemDetails = itemDetailsFromDatabase;

        return NextResponse.json({itemIconUrl, itemDetails, displayId})
    }

    return fetchNewItem(supabase, token, itemId)
}
