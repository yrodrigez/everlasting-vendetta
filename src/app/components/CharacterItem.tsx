'use client'
import axios from "axios";
import {ItemImageWithRune} from "@/app/roster/[name]/components/ItemImageWithRune";
import {useEffect, useState} from "react";
import {useCharacterItemsStore} from "@/app/roster/[name]/characterItemsStore";


interface APIReference {
    href: string;
}

interface Item {
    key: APIReference;
    id: number;
}

interface Slot {
    type: string;
    name: string;
}

interface Quality {
    type: string;
    name: string;
}

interface Media {
    key: APIReference;
    id: number;
}

interface ItemClass {
    key: APIReference;
    name: string;
    id: number;
}

interface ItemSubclass {
    key: APIReference;
    name: string;
    id: number;
}

interface InventoryType {
    type: string;
    name: string;
}

interface Binding {
    type: string;
    name: string;
}

interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}

interface Display {
    display_string: string;
    color: Color;
}

interface Armor {
    value: number;
    display: Display;
}

interface Stat {
    type: {
        type: string;
        name: string;
    };
    value: number;
    display: Display;
}

interface Spell {
    spell: Item;
    description: string;
}

interface SellPrice {
    value: number;
    display_strings: {
        header: string;
        gold: string;
        silver: string;
        copper: string;
    };
}

interface Requirements {
    level?: {
        value: number;
        display_string: string;
    };
    skill?: {
        profession: Item;
        level: number;
        display_string: string;
    };
}

export type Enchantment = {
    "display_string": string,
    "enchantment_id": number,
    "enchantment_slot": {
        "id": number,
        "type": "PERMANENT" | "TEMPORARY"
    }
}

export interface ItemDetails {
    item: Item;
    slot: Slot;
    quantity: number;
    quality: Quality;
    name: string;
    media: Media;
    item_class: ItemClass;
    item_subclass: ItemSubclass;
    inventory_type: InventoryType;
    binding: Binding;
    limit_category?: string;
    enchantments?: Enchantment[];
    armor: Armor;
    stats: Stat[];
    spells: Spell[];
    sell_price: SellPrice;
    requirements: Requirements;
    description: string;
    details: any;
    durability: {
        value: number;
        display_string: string;
    };
}

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

export async function fetchItemDetails(token: string, itemId: number, locale: string = 'en_US') {
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

function getItemRarityHexColor(quality: string) {
    const rarityColors = {
        'POOR': '#9d9d9d',
        'COMMON': '#ffffff',
        'UNCOMMON': '#1eff00',
        'RARE': '#0070dd',
        'EPIC': '#a335ee',
        'LEGENDARY': '#ff8000',
        'ARTIFACT': '#e6cc80',
        'HEIRLOOM': '#00ccff',
    } as any

    return rarityColors[quality] || '#ffffff';
}

export default function ({item, token, reverse, bottom, characterName}: {
    item: ItemDetails,
    token: string,
    reverse?: boolean,
    bottom?: boolean,
    characterName: string
}) {
    if (!item) return null;
    const {id,} = item?.item || {} as any
    const {name, quality, slot} = item || {};
    const [itemIconUrl, setItemIconUrl] = useState<string>(getKnownItemImage(999999));
    const [itemDetails, setItemDetails] = useState<any>({level: '??'});
    const updateItem = useCharacterItemsStore(state => state.updateItem)
    useEffect(() => {
        updateItem({...item, loading: true});
        ((async () => {
            const itemIconUrl = await fetchItemMedia(token, id);
            setItemIconUrl(itemIconUrl);
            const itemDetails = await fetchItemDetails(token, id);
            setItemDetails(itemDetails);
            updateItem({
                ...item,
                details: itemDetails
            })
        })())
    }, [id])

    return (
        <div

            className={`flex items-center gap-4 ${reverse ? 'flex-row-reverse' : ''}`}>
            <ItemImageWithRune
                item={item}
                itemIconUrl={itemIconUrl}
                reverse={reverse}
                bottom={bottom}
                borderColor={getItemRarityHexColor(quality.name.toUpperCase())}
            />
            <div className={`flex-col gap-0.5 ${reverse ? 'text-right' : 'text-left'} break-all`}>
                <h3 className="font-semibold text-sm md:hidden">{slot.name}</h3>
                <h3 className="font-semibold text-sm hidden md:flex">{name}</h3>
                <p className="text-xs text-muted">Item Level {itemDetails.level}</p>
            </div>
        </div>
    )
}
