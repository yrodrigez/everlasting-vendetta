export type RaidItem = {
    id: number;
    created_at: string;
    name: string;
    description: {
        icon: string;
        name: string;
        quality?: 0 | 1 | 2 | 3 | 4 | 5;
        tooltip: string;
        spells: []
        qualityName: string;
        itemClass: string;
        itemSubclass: string;
        inventoryType: string;
    };
    raid_id: string;
    isHardReserved?: boolean;
    boss: {
        id: number;
        name: string;
        avatar_url?: string;
        info_url?: string;
    }
};
export type RaidReset = {
    id: string;
    raid_date: string;
    name: string;
    min_lvl: number;
    image_url: string;
    time: string;
    end_date: string;
    reservations_closed: boolean;
};

export type Reservation = {
    id: string;
    item_id: number;
    item: RaidItem;
    reset: RaidReset;
    member: {
        id: number;
        character: Character;
    };
}

export type Character = {
    id: number;
    name: string;
    realm: string;
    level: number;
    guild?: {
        name: string;
        id: number;
    };
    avatar?: string;
    role?: {
        name: string;
        permissions: string[];
    };
    selectedRole?: string;
    playable_class?: {
        name: string;
    };
};
