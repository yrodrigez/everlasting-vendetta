export interface Character {
    id: string;
    name: string;
    className: string;
    level: number;
    realm: {
        id?: number;
        name?: string;
        slug?: string;
    }
    avatar: string;
}