export type MemberRole =
    'tank'
    | 'healer'
    | 'dps'
    | 'tank-healer'
    | 'tank-dps'
    | 'healer-dps'
    | 'tank-healer-dps'
    | undefined

export type CharacterClassName =
    'Warrior'
    | 'Paladin'
    | 'Hunter'
    | 'Rogue'
    | 'Priest'
    | 'Shaman'
    | 'Mage'
    | 'Warlock'
    | 'Druid'

export type Member = {
    id: number;
    created_at: string;
    updated_at: string;
    character: {
        id: number;
        name: string;
        level: number;
        avatar: string;
        last_login_timestamp: number;
        realm: {
            id: number;
            name: string;
            slug: string;
        };
        playable_class: {
            name: CharacterClassName;
        };
        character_class: {
            name: CharacterClassName;
        };
        guild: {
            id: number;
            name: string;
            rank: number;
        }
    }
    registration_source: 'bnet_oauth' | 'temporal' | 'manual_reservation';
}
