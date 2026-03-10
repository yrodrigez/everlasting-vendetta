interface Links {
    self: {
        href: string;
    };
    user: {
        href: string;
    };
    profile: {
        href: string;
    };
}

interface UserProfile {
    id: number;
    wow_accounts: WoWAccount[];
}

interface WoWAccount {
    id: number;
    characters: Character[];
}

interface Character {
    character: {
        href: string;
    };
    protected_character: {
        href: string;
    };
    name: string;
    id: number;
    realm: Realm;
    playable_class: PlayableClass;
    playable_race: PlayableRace;
    character_class?: PlayableClass;
    gender: Gender;
    faction: Faction;
    guild?: {
        key: {
            href: string;
        };
        name: string;
        id: number;
    }
    level: number;
}

interface Realm {
    key: {
        href: string;
    };
    name: string;
    id: number;
    slug: string;
}

interface PlayableClass {
    key: {
        href: string;
    };
    name: string;
    id: number;
}

interface PlayableRace {
    key: {
        href: string;
    };
    name: string;
    id: number;
}

interface Gender {
    type: string;
    name: string;
}

interface Faction {
    type: string;
    name: string;
}

interface FetchBattleNetApiResponse {
    _links: Links;
    id: number;
    wow_accounts: WoWAccount[];
}

export type {
    Links,
    UserProfile,
    WoWAccount,
    Character,
    Realm,
    PlayableClass,
    PlayableRace,
    FetchBattleNetApiResponse
}
