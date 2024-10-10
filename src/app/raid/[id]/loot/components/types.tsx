export type RaidLoot = {
    id: string;
    dateTime: string;
    raid_id: string;
    itemID: number;
    character: string;
    offspec: number;
    item: Item;
    isPlus?: boolean;
}
export type Item = {
    name: string;
    quality: number;
    icon: string;
    tooltip: string;
    spells: any[];
    id: number;
    isPlus?: boolean;
}
export type CharacterWithLoot = {
    character: string;
    character_id?: number;
    loot: RaidLoot[];
    plusses: number;
}
