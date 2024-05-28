'use client'
import axios from "axios";
import {ItemImageWithRune} from "@/app/roster/[name]/components/ItemImageWithRune";
import {useEffect, useState} from "react";
import {useCharacterItemsStore} from "@/app/roster/[name]/characterItemsStore";
import {Skeleton} from "@nextui-org/react";


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

export default function ({item: _item, token, reverse, bottom, characterName}: {
    item: ItemDetails,
    token: string,
    reverse?: boolean,
    bottom?: boolean,
    characterName: string
}) {
    if (!_item) return null;
    const items = useCharacterItemsStore(state => state.items)
    const [item, setItem] = useState<any>(items.find((i: any) => i.item?.id === _item.item.id) || _item)
    const [loading, setLoading] = useState<boolean>(true)
    const {id,} = item?.item || {} as any
    const {name, quality, slot} = item || {};
    const [itemIconUrl, setItemIconUrl] = useState<string>('');
    const [itemDetails, setItemDetails] = useState<any>({level: '??'});
    const updateItem = useCharacterItemsStore(state => state.updateItem)
    useEffect(() => {
        if (item.details) {
            setItemDetails(item.details)
            setItemIconUrl(item.itemIconUrl)
            setLoading(false)
            return;
        }
        updateItem({...item, loading: true});
        ((async () => {
            const url = `${window.location.origin}/api/v1/services/wow/fetchItem?itemId=${id}&token=${token}`
            const response = await fetch(
                url
            );
            if (!response.ok) {
                setLoading(false)
                return;
            }
            const {itemIconUrl, itemDetails, displayId} = await response.json()
            setItemIconUrl(itemIconUrl);
            setItemDetails(itemDetails);
            updateItem({
                id,
                displayId,
                ...item,
                itemIconUrl,
                details: itemDetails
            })
            setLoading(false)
        })())
    }, [id])

    return (
        <div className={`flex items-center gap-4 ${reverse ? 'flex-row-reverse' : ''}`}>
            <Skeleton isLoaded={!loading} className={`w-12 h-12  bg-wood ${loading ? 'rounded-lg' : ''}`}>
                <ItemImageWithRune
                    item={item}
                    itemIconUrl={itemIconUrl}
                    reverse={reverse}
                    bottom={bottom}
                    borderColor={getItemRarityHexColor(quality.name.toUpperCase())}
                />
            </Skeleton>
            <div className={`flex-col gap-10 ${reverse ? 'text-right' : 'text-left'} break-all`}>
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
