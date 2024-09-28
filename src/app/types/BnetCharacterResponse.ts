export type BnetCharacterResponse = {
    _links: {
        self: {
            href: string;
        };
    };
    id: number;
    name: string;
    gender: {
        type: string;
        name: string;
    };
    faction: {
        type: string;
        name: string;
    };
    race: {
        key: {
            href: string;
        };
        name: string;
        id: number;
    };
    character_class: {
        key: {
            href: string;
        };
        name: string;
        id: number;
    };
    active_spec: {
        key: {
            href: string;
        };
        id: number;
    };
    realm: {
        key: {
            href: string;
        };
        name: string;
        id: number;
        slug: string;
    };
    guild: {
        key: {
            href: string;
        };
        name: string;
        id: number;
        realm: {
            key: {
                href: string;
            };
            name: string;
            id: number;
            slug: string;
        };
        faction: {
            type: string;
            name: string;
        };
    };
    level: number;
    experience: number;
    titles: {
        href: string;
    };
    pvp_summary: {
        href: string;
    };
    media: {
        href: string;
    };
    last_login_timestamp: number;
    average_item_level: number;
    equipped_item_level: number;
    specializations: {
        href: string;
    };
    statistics: {
        href: string;
    };
    equipment: {
        href: string;
    };
    appearance: {
        href: string;
    };
    avatar: string;
};
