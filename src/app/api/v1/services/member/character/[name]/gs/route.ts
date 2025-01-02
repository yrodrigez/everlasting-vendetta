import {NextRequest, NextResponse} from "next/server";
import {cookies} from "next/headers";
import {getBlizzardToken} from "@/app/lib/getBlizzardToken";
import WoWService from "@/app/services/wow-service";
import {createBlizzardItemFetchUrl} from "@utils/constants";
import axios from "axios";
import {calculateTotalGearScore, getColorForGearScoreText} from "@/app/roster/[name]/ilvl";

async function fetchItemDetails(token: string, itemId: number) {
    try {
        const {data} = await axios.get(createBlizzardItemFetchUrl(itemId), {
            headers: {'Authorization': 'Bearer ' + token}
        })
        return data;
    } catch (e) {
        console.error('Error fetching item details:', e)
        return {quality: {}, level: 0}
    }
}

const quality ={
    'POOR': 0,
    'COMMON': 1,
    'UNCOMMON': 2,
    'RARE': 3,
    'EPIC': 4,
    'LEGENDARY': 5,
}

export async function GET(req: NextRequest, context: any) {
    const cookieToken = cookies().get(process.env.BNET_COOKIE_NAME!)?.value
    const {token} = (cookieToken ? {token: cookieToken} : (await getBlizzardToken()))

    if (!token) {
        return NextResponse.json({error: 'Error - token is mandatory!'})
    }

    const name = (context.params.name ?? '').toLowerCase();
    if (!name) {
        return NextResponse.json({error: 'Error - name is mandatory!'}, {status: 400})
    }

    const {
        fetchEquipment,
    } = new WoWService({token: {value: token}})
    const equipment = await fetchEquipment(name);

    const items_raw = equipment?.equipped_items?.map((item: any) => ({
        id: item.item.id,
        type: `INVTYPE_${item.inventory_type?.type}`,
        isEnchanted: item.enchantments?.filter((e: any) => e.enchantment_slot?.type === 'PERMANENT').length > 0,
    })) ?? [];

    const items = await Promise.all(items_raw.map(async (item: any) => {
        const itemDetails = await fetchItemDetails(token, item.id);
        return {
            ...item,
            ilvl: itemDetails.level,
            // @ts-ignore
            rarity: quality[itemDetails.quality.type] ?? 0,
        }
    }));

    const gs = calculateTotalGearScore(items.filter(Boolean).filter(item => item.ilvl > 0 && item.type.indexOf('INVTYPE_') !== -1));
    return NextResponse.json({gs: gs, color: getColorForGearScoreText(gs)});
}
