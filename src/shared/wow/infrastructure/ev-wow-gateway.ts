import { WowGatewayError } from '../application/errors/wow-gateway-error';
import type { GetUserCharactersParams, WowGateway } from '../application/ports/wow-gateway';

export class EvWowGateway implements WowGateway {
    constructor(private readonly baseUrl: string) {
        if (!baseUrl) {
            throw new Error('EvWowGateway requires a baseUrl');
        }
    }

    async getUserCharacters(params: GetUserCharactersParams): Promise<unknown> {
        const response = await fetch(
            `${this.baseUrl}/wow/user/characters?realmSlug=${encodeURIComponent(params.realmSlug)}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${params.accessToken}`,
                },
                credentials: 'include',
            },
        );

        if (!response.ok) {
            const payload = await response.text().catch(() => undefined);
            throw new WowGatewayError('Failed to fetch user characters', response.status, payload);
        }

        return response.json();
    }
}
