import axios from "axios";
import {cookies} from "next/headers";
import {type NextRequest, NextResponse} from "next/server";

function getKnownItemImage(itemId: number) {
    const knownImages = {
        215161: 'https://wow.zamimg.com/images/wow/icons/large/inv_helmet_49.jpg',
        210781: 'https://wow.zamimg.com/images/wow/icons/large/inv_bracer_25a.jpg',
        211450: 'https://wow.zamimg.com/images/wow/icons/large/inv_misc_gem_pearl_07.jpg',
        215111: 'https://wow.zamimg.com/images/wow/icons/large/inv_misc_enggizmos_27.jpg',
        999999: 'https://wow.zamimg.com/images/wow/icons/medium/inventoryslot_empty.jpg',
        0: 'https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg',
        216494: 'https://wow.zamimg.com/images/wow/icons/large/spell_shadow_demoniccircleteleport.jpg',
        213409: 'https://wow.zamimg.com/images/wow/icons/large/inv_weapon_hand_08.jpg',
        213350: 'https://wow.zamimg.com/images/wow/icons/large/inv_gizmo_khoriumpowercore.jpg',

    } as any
    return knownImages[itemId] || ''
}

async function fetchItemMedia(token: string, itemId: number, locale: string = 'en_US') {
    let imageUrl = getKnownItemImage(itemId);
    if (imageUrl) {
        return imageUrl;
    }
    try {
        const url = `https://eu.api.blizzard.com/data/wow/media/item/${itemId}?namespace=static-classic1x-eu&locale=${locale}`;
        const {data} = await axios.get(`${url}`, {
            headers: {'Authorization': 'Bearer ' + token}
        })
        imageUrl = data.assets.find((asset: any) => {
            return asset.key === 'icon'
        })?.value || getKnownItemImage(0)
        return imageUrl;
    } catch (e) {
        //console.error('Error fetching item media:', e)
        return getKnownItemImage(0)
    }
}

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
    return knownItemLevels[itemId] || 0;

}

async function fetchItemDetails(token: string, itemId: number, locale: string = 'en_US') {
    const url = `https://eu.api.blizzard.com/data/wow/item/${itemId}?namespace=static-classic1x-eu&locale=${locale}`;
    let itemDetails = {quality: {}, level: knownItemLevelQuality(itemId)} as any;

    try {
        const {data} = await axios.get(`${url}`, {
            headers: {'Authorization': 'Bearer ' + token}
        })
        itemDetails = data;
    } catch (e) {
        //console.error('Error fetching item details:', e)

    }
    if (itemDetails.quality.level === 0) {
        console.error('Item quality not found for item:', itemId)
    }
    return itemDetails;
}

export async function GET(request: NextRequest) {
    const cookieList = cookies()
    let token = cookieList.get(process.env.BNET_COOKIE_NAME!)
    const url = new URL(request.url)
    const itemId = Number(url.searchParams.get('itemId'))
    if (!token?.value) {

        token = {value: url.searchParams.get('token') ?? '', name: process.env.BNET_COOKIE_NAME!}
    }

    const itemIconUrl = await fetchItemMedia(token?.value, itemId);
    const itemDetails = await fetchItemDetails(token?.value, itemId);

    return NextResponse.json({itemIconUrl, itemDetails})
}
