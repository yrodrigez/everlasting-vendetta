export type UserProfile = {
    userId: string;
    id: number;
    name: string;
    realm: {
        name: string;
        slug: string;
        id: number;
    };
    level: number;
    playable_class: {
        name: string;
    };
    guild: {
        name: string;
        id: number;
        rank: number;
    };
    character_class: {
        name: string;
    };
    last_login_timestamp: number;
    avatar: string;
    source: string;
    isTemporal: boolean;
    isAdmin: boolean;
    roles: string[];
    permissions: string[];
};
