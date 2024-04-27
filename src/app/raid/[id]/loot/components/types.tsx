export type RaidLoot = {
    id: string;
    dateTime: string;
    raid_id: string;
    itemID: number;
    character: string;
    offspec: number;
    item: Item;
}
export type Item = {
    name: string;
    quality: number;
    icon: string;
    tooltip: string;
    spells: any[];
    id: number;
}
export type CharacterWithLoot = {
    character: string;
    loot: RaidLoot[];
}
