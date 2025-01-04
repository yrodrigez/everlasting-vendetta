import {NextRequest, NextResponse} from "next/server";
import {cookies} from "next/headers";
import {getBlizzardToken} from "@/app/lib/getBlizzardToken";
import WoWService from "@/app/services/wow-service";
import {calculateTotalGearScore, getColorForGearScoreText} from "@/app/roster/[name]/ilvl";
import createServerSession from "@utils/supabase/createServerSession";
import {createHash} from "node:crypto";

async function fetchItemDetails(itemId: number, force: boolean = false) {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/services/wow/fetchItem?itemId=${itemId}&force=${force}`
    const response = await fetch(url)
    if (!response.ok) {
        console.error('Error fetching item details:', response.status, response.statusText)
        return {quality: {}, level: 0}
    }
    const data = await response.json()

    return {
        quality: data.itemDetails.quality,
        level: data.itemDetails.level,
    }
}

const quality = {
    'POOR': 0,
    'COMMON': 1,
    'UNCOMMON': 2,
    'RARE': 3,
    'EPIC': 4,
    'LEGENDARY': 5,
}

function createMd5(items_raw: {
    id: number;
    type: string;
    isEnchanted: boolean;
}[]) {
    const str = JSON.stringify(items_raw);
    return createHash('sha256').update(str, 'utf8').digest('hex')
}

export async function GET(request: NextRequest, context: any) {
    const cookieToken = (await cookies()).get(process.env.BNET_COOKIE_NAME!)?.value
    const {token} = (cookieToken ? {token: cookieToken} : (await getBlizzardToken()))

    if (!token) {
        return NextResponse.json({error: 'Error - token is mandatory!'})
    }

    const params = await context.params;
    const name = (params?.name ?? '').toLowerCase();
    if (!name) {
        return NextResponse.json({error: 'Error - name is mandatory!'}, {status: 400})
    }

    const {
        fetchEquipment,
    } = new WoWService({token: {value: token}})
    const equipment = await fetchEquipment(name);

    const items_raw = equipment?.equipped_items?.map((item: any) => ({
        id: parseInt(item?.item?.id ?? 0, 10),
        type: `INVTYPE_${item.inventory_type?.type}`,
        isEnchanted: item.enchantments?.filter((e: any) => e.enchantment_slot?.type === 'PERMANENT').length > 0,
    })) ?? [];
    const {supabase} = await createServerSession({cookies})
    const md5 = createMd5(items_raw.sort((a: { id: number }, b: { id: number }) => a.id - b.id));

    const {data: cachedData} = await supabase
        .from('gs_cache')
        .select('gs,color')
        .eq('md5', md5)
        .maybeSingle();

    const url = new URL(request.url)
    const force = url.searchParams.get('force') === 'true'
    if (cachedData && !force) {
        return NextResponse.json({gs: cachedData.gs, color: cachedData.color});
    }

    const items = await Promise.all(items_raw.map(async (item: any) => {
        const itemDetails = await fetchItemDetails(item.id, force);
        return {
            ...item,
            ilvl: itemDetails.level,
            // @ts-ignore
            rarity: quality[itemDetails.quality.type] ?? 0,
        }
    }));

    const gs = calculateTotalGearScore(items.filter(Boolean).filter(item => item.ilvl > 0 && item.type.indexOf('INVTYPE_') !== -1));
    const color = getColorForGearScoreText(gs);
    const {error} = await supabase.from('gs_cache').upsert({md5, gs, color});
    if (error) {
        console.error('Error saving gear score to cache:', error)
    }

    return NextResponse.json({gs: gs, color});
}
