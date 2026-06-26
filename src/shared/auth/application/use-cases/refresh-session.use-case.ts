import { RefreshSessionError } from '../errors/refresh-session-error';
import type { AuthGateway, RefreshAuthResponse } from '../ports/auth-gateway';
import type { SessionStore } from '../ports/session-store';

export interface RefreshSessionResult {
    accessToken: string;
    redirectTo?: string | null;
}

export interface RefreshSessionUseCaseDependencies {
    sessionStore: SessionStore;
    authGateway: AuthGateway;
    providerRedirects?: Record<string, string>;
}

const DEFAULT_PROVIDER_REDIRECTS: Record<string, string> = {
    bnet: '/api/v1/oauth/bnet/auth',
    discord: '/api/v1/oauth/discord/auth',
};

export class RefreshSessionUseCase {
    private readonly providerRedirects: Record<string, string>;

    constructor(private readonly dependencies: RefreshSessionUseCaseDependencies) {
        this.providerRedirects = dependencies.providerRedirects ?? DEFAULT_PROVIDER_REDIRECTS;
    }

    async execute(): Promise<RefreshSessionResult> {
        const refreshTokenEntry = this.dependencies.sessionStore.getRefreshToken();

        if (!refreshTokenEntry) {
            console.log('No refresh token found in session store', refreshTokenEntry);
            throw new RefreshSessionError('No refresh token', 401);
        }

        let refreshResponse: RefreshAuthResponse;

        try {
            refreshResponse = await this.dependencies.authGateway.refresh({
                sessionId: refreshTokenEntry.value,
            });
        } catch (error) {
            await this.dependencies.sessionStore.clear();
            throw new RefreshSessionError('Refresh failed', 401, { cause: error });
        }

        await this.dependencies.sessionStore.replaceRefreshToken(
            refreshTokenEntry.key,
            refreshResponse.sessionId,
            refreshResponse.expiresAt,
        );

        const redirectTo = this.resolveRedirect(refreshResponse);

        return {
            accessToken: refreshResponse.accessToken,
            redirectTo,
        };
    }

    private resolveRedirect(response: RefreshAuthResponse): string | null {
        if (!response.provider) {
            return null;
        }

        return this.providerRedirects[response.provider] ?? null;
    }
}
