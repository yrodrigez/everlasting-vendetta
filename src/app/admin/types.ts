export type MemberRole = {
    id: number;
    role: string;
    member_id: number;
    created_at: string;
}

export type RolePermission = {
    id: string,
    role: string,
}

export type Role = {
    id: string;
    created_at: string;
}

export type UserProfile = {
    id: number;
    created_at: string;
    updated_at: string;
    character: {
        id: number;
        name: string;
        guild: {
            id: number;
            name: string;
            rank: number;
        };
        level: number;
        realm: {
            id: number;
            name: string;
            slug: string;
        };
        avatar: string;
        playable_class: {
            name: string;
        };
        character_class: {
            name: string;
        };
        last_login_timestamp: number;
    },
    registration_source: string;
}


