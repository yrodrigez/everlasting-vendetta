export type RaidLoot = {
    id: string;
    dateTime: string;
    raid_id: string;
    itemID: number;
    character: string;
    offspec: number;
    item: {
        name: string;
        quality: number;
        icon: string;
        tooltip: string;
        spells: any[];
    };
}
