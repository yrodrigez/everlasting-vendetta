import { RefreshSessionError } from '../errors/refresh-session-error';
import type { AuthGateway, RefreshAuthResponse } from '../ports/auth-gateway';
import type { Encryptor } from '../ports/encryptor';
import type { SessionStore } from '../ports/session-store';

export interface RefreshSessionResult {
    accessToken: string;
    shouldRefreshProviderToken: boolean;
    redirectTo?: string | null;
}

export interface RefreshSessionUseCaseDependencies {
    sessionStore: SessionStore;
    authGateway: AuthGateway;
    encryptor: Encryptor<{ iv: string; ciphertext: string }>;
    providerRedirects?: Record<string, string>;
    serializeSessionInfo?: (payload: { iv: string; ciphertext: string }) => string;
}

const DEFAULT_PROVIDER_REDIRECTS: Record<string, string> = {
    bnet: '/api/v1/oauth/bnet/refresh',
};

export class RefreshSessionUseCase {
    private readonly providerRedirects: Record<string, string>;
    private readonly serializeSessionInfo?: (payload: { iv: string; ciphertext: string }) => string;

    constructor(private readonly dependencies: RefreshSessionUseCaseDependencies) {
        this.providerRedirects = dependencies.providerRedirects ?? DEFAULT_PROVIDER_REDIRECTS;
        this.serializeSessionInfo = dependencies.serializeSessionInfo;
    }

    async execute(): Promise<RefreshSessionResult> {
        const refreshTokenEntry = this.dependencies.sessionStore.getRefreshToken();

        if (!refreshTokenEntry) {
            throw new RefreshSessionError('No refresh token', 401);
        }

        let refreshResponse: RefreshAuthResponse;

        try {
            refreshResponse = await this.dependencies.authGateway.refresh({
                refreshToken: refreshTokenEntry.value,
            });
        } catch (error) {
            await this.dependencies.sessionStore.clear();
            throw new RefreshSessionError('Refresh failed', 401, { cause: error });
        }

        await this.dependencies.sessionStore.replaceRefreshToken(
            refreshTokenEntry.key,
            refreshResponse.refreshToken,
            refreshResponse.refreshTokenExpiry,
        );

        const encodedSessionInfo = await this.encodeAccessTokenPayload(refreshResponse.accessToken);

        if (encodedSessionInfo) {
            await this.dependencies.sessionStore.saveSessionInfo(
                encodedSessionInfo,
                refreshResponse.accessTokenExpiry,
            );
        }

        const redirectTo = this.resolveRedirect(refreshResponse);

        return {
            accessToken: refreshResponse.accessToken,
            shouldRefreshProviderToken: refreshResponse.shouldRefreshProviderToken,
            redirectTo,
        };
    }

    private async encodeAccessTokenPayload(accessToken: string): Promise<string | null> {
        if (!accessToken) {
            return null;
        }

        const [, sessionInfo] = accessToken?.split('.');

        if (!sessionInfo) {
            return null;
        }

        const encrypted = await this.dependencies.encryptor.encrypt(sessionInfo);
        const serialized = this.serializeSessionInfo
            ? this.serializeSessionInfo(encrypted)
            : toBase64(JSON.stringify(encrypted));

        return serialized;
    }

    private resolveRedirect(response: RefreshAuthResponse): string | null {
        if (!response.shouldRefreshProviderToken || !response.provider) {
            return null;
        }

        return this.providerRedirects[response.provider] ?? null;
    }
}

function toBase64(value: string): string {
    return Buffer.from(value, 'utf-8').toString('base64');
}
