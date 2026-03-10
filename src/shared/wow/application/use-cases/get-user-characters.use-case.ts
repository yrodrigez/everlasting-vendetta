import type { SessionStore } from '@/shared/auth/application/ports/session-store';

import type { WowGateway } from '@/shared/wow/application/ports/wow-gateway';
import { WowGatewayError } from '@/shared/wow/application/errors/wow-gateway-error';
import { GetUserCharactersError } from '@/shared/wow/application/errors/get-user-characters-error';

export interface GetUserCharactersInput {
    authorizationHeader: string | null;
    realmSlug: string;
}

export class GetUserCharactersUseCase {
    constructor(private readonly dependencies: { sessionStore: SessionStore; wowGateway: WowGateway }) {}

    async execute(input: GetUserCharactersInput) {
        const refreshTokenEntry = this.dependencies.sessionStore.getRefreshToken();

        if (!refreshTokenEntry || !refreshTokenEntry.value) {
            throw new GetUserCharactersError('No refresh token', 401);
        }

        const accessToken = this.extractAccessToken(input.authorizationHeader);

        if (!accessToken) {
            throw new GetUserCharactersError('No access token', 401);
        }

        try {
            return await this.dependencies.wowGateway.getUserCharacters({
                accessToken,
                realmSlug: input.realmSlug,
            });
        } catch (error) {
            if (error instanceof WowGatewayError) {
                throw new GetUserCharactersError('Failed to fetch user characters', error.status, { cause: error });
            }
            throw new GetUserCharactersError('Failed to fetch user characters', 502, { cause: error });
        }
    }

    private extractAccessToken(header: string | null): string | null {
        if (!header) {
            return null;
        }

        const [scheme, token] = header.split(' ');
        if (scheme !== 'Bearer' || !token) {
            return null;
        }
        return token;
    }
}
