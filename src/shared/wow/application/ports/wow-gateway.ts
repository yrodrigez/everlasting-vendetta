export interface GetUserCharactersParams {
    accessToken: string;
    realmSlug: string;
}

export interface WowGateway {
    getUserCharacters(params: GetUserCharactersParams): Promise<unknown>;
}
