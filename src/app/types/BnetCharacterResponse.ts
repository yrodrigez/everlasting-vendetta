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

export const createEmptyBnetCharacterResponse = (): BnetCharacterResponse => {
    return {
        active_spec: {id: 0, key: {href: ""}},
        appearance: {href: ""},
        avatar: "",
        average_item_level: 0,
        character_class: {id: 0, key: {href: ""}, name: ""},
        equipment: {href: ""},
        equipped_item_level: 0,
        experience: 0,
        faction: {name: "", type: ""},
        gender: {name: "", type: ""},
        guild: {
            faction: {name: "", type: ""},
            id: 0,
            key: {href: ""},
            name: "",
            realm: {id: 0, key: {href: ""}, name: "", slug: ""}
        },
        last_login_timestamp: 0,
        level: 0,
        media: {href: ""},
        pvp_summary: {href: ""},
        race: {id: 0, key: {href: ""}, name: ""},
        realm: {id: 0, key: {href: ""}, name: "", slug: ""},
        specializations: {href: ""},
        statistics: {href: ""},
        titles: {href: ""},
        _links: {
            self: {
                href: '',
            },
        },
        id: 0,
        name: ''
    }
}
