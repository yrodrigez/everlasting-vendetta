'use client'
import {ItemImageWithRune} from "@/app/roster/[name]/components/ItemImageWithRune";
import {useState} from "react";
import {useCharacterItemsStore} from "@/app/roster/[name]/characterItemsStore";
import {Skeleton, Tooltip} from "@heroui/react";
import {itemTypeInfo} from "@/app/roster/[name]/ilvl";
import {useQuery} from "@tanstack/react-query";
import {faWandMagic, faWandMagicSparkles} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";


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

export default function ({item: _item, token, reverse, bottom}: {
    item: ItemDetails
    token: string
    reverse?: boolean
    bottom?: boolean
}) {
    const items = useCharacterItemsStore(state => state.items)
    const [item] = useState<any>(items.find((i: any) => i.item?.id === _item.item.id) ?? _item)
    const {id,} = item?.item || {} as any
    const {name, quality, slot} = item || {};
    const [itemIconUrl, setItemIconUrl] = useState<string>(item?.itemIconUrl ?? '');
    const [itemDetails, setItemDetails] = useState<any>(item?.details ?? {level: '??'});
    const updateItem = useCharacterItemsStore(state => state.updateItem)

    const [_, isEnchantable] = itemTypeInfo[`INVTYPE_${item.inventory_type?.type}`] ?? [0, false];
    const isEnchanted = item.enchantments?.filter((enchant: any) => enchant.enchantment_slot.type !== 'TEMPORARY').length && isEnchantable

    const {isLoading: loading} = useQuery({
        queryKey: ['item', item],
        queryFn: async () => {

            const url = `/api/v1/services/wow/fetchItem?itemId=${id}`
            updateItem({
                ...item,
                loading: true
            })
            const response = await fetch(
                url
            );
            if (!response.ok) {
                throw new Error('Failed to fetch item')
            }
            const {itemIconUrl, itemDetails, displayId} = await response.json()
            setItemIconUrl(itemIconUrl);
            setItemDetails(itemDetails);
            updateItem({
                id,
                displayId,
                ...item,
                itemIconUrl,
                details: itemDetails,
                loading: false
            })

            return {itemIconUrl, itemDetails, displayId}
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 3
    })


    return (
        <div className={`flex items-center gap-4 ${reverse ? 'flex-row-reverse' : ''}`}>
            <Skeleton isLoaded={!loading} className={`w-12 h-12 relative  bg-wood ${loading ? 'rounded-lg' : ''}`}>
                <ItemImageWithRune
                    item={item}
                    itemIconUrl={itemIconUrl}
                    reverse={reverse}
                    bottom={bottom}
                    borderColor={getItemRarityHexColor(quality.name.toUpperCase())}
                />
                <div
                    className={`hidden lg:flex absolute ${bottom ? '-top-5 right-4' : !reverse ? '-left-6 bottom-4' : '-right-6 bottom-4'}  flex items-center gap-1`}>
                    <Tooltip
                        content={<p>{isEnchanted ? 'Enchanted' : 'Not Enchanted'}</p>}
                        placement={bottom ? 'top' : 'right'}
                    >
                        {!isEnchantable ? null : isEnchanted ?
                            <FontAwesomeIcon className={`text-gold`} icon={faWandMagicSparkles}/> :
                            <FontAwesomeIcon className="text-gray-500" icon={faWandMagic}/>}
                    </Tooltip>
                </div>
            </Skeleton>
            <div className={`flex-col gap-10 ${reverse ? 'text-right' : 'text-left'} break-all relative`}>
                <Skeleton isLoaded={!loading} className={`h-4 bg-wood ${loading ? 'rounded-full' : ''}`}>
                    <h3 className="font-semibold text-sm hidden md:flex">{name}</h3>
                    <h3 className="font-semibold text-sm md:hidden">{slot.name}</h3>
                </Skeleton>
                <Skeleton isLoaded={!loading} className={`h-4 bg-wood mt-1 ${loading ? 'rounded-full' : ''}`}>
                    <p className="text-xs text-muted">Item Level {itemDetails.level}</p>
                </Skeleton>
            </div>
        </div>
    )
}
