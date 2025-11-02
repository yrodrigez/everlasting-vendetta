import type { BnetOAuthGateway, BnetTokenResponse } from '../application/ports/bnet-oauth-gateway';

class BattleNetOAuthGatewayError extends Error {
    readonly status: number;
    readonly payload?: unknown;

    constructor(message: string, status: number, payload?: unknown) {
        super(message);
        this.name = 'BattleNetOAuthGatewayError';
        this.status = status;
        this.payload = payload;
    }
}

export class BattleNetOAuthGateway implements BnetOAuthGateway {
    private readonly authorizationHeader: string;

    constructor(clientId: string, clientSecret: string) {
        if (!clientId) {
            throw new Error('BattleNetOAuthGateway requires a clientId');
        }

        if (!clientSecret) {
            throw new Error('BattleNetOAuthGateway requires a clientSecret');
        }

        this.authorizationHeader = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
    }

    async exchangeCode(params: { code: string; redirectUri: string }): Promise<BnetTokenResponse> {
        const response = await fetch('https://oauth.battle.net/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: this.authorizationHeader,
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: params.code,
                redirect_uri: params.redirectUri,
            }),
        });

        const payload = await response.json().catch(() => undefined);

        if (!response.ok) {
            throw new BattleNetOAuthGatewayError('Battle.net OAuth failed', response.status, payload);
        }

        return payload as BnetTokenResponse;
    }
}

export { BattleNetOAuthGatewayError };
