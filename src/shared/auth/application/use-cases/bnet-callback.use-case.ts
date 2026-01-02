import type { BnetOAuthGateway } from '../ports/bnet-oauth-gateway';
import type { AuthGateway } from '../ports/auth-gateway';
import type { Encryptor } from '../ports/encryptor';
import type { SessionStore } from '../ports/session-store';
import createServerSession from '@/app/util/supabase/createServerSession';
import { getEnvironment } from '@/infrastructure/environment';

type CallbackState = {
    redirectedFrom?: string;
    windowOpener?: boolean;
    linkAccount?: boolean;
};

export type BnetCallbackResult =
    | {
        type: 'redirect';
        url: string;
        reason: 'success' | 'missing_code' | 'bnet_oauth_failed' | 'auth_failed' | 'link_account_failed' | 'not_logged_in';
        cause?: unknown;
    }
    | {
        type: 'window-opener';
        reason: 'success';
    };

export interface BnetCallbackUseCaseInput {
    code: string | null;
    state: string | null;
    origin: string;
}

export interface BnetCallbackUseCaseDependencies {
    sessionStore: SessionStore;
    authGateway: AuthGateway;
    bnetOAuthGateway: BnetOAuthGateway;
    encryptor: Encryptor<{ iv: string; ciphertext: string }>;
    redirectUri: string;
    isProduction: boolean;
    productionOrigin: string;
    defaultRedirectPath?: string;
    now?: () => number;
    serializeSessionInfo?: (payload: { iv: string; ciphertext: string }) => string;
}

const DEFAULT_REDIRECT_PATH = '/';

export class BnetCallbackUseCase {
    private readonly now: () => number;
    private readonly serializeSessionInfo?: (payload: { iv: string; ciphertext: string }) => string;
    private readonly defaultRedirectPath: string;

    constructor(private readonly dependencies: BnetCallbackUseCaseDependencies) {
        this.now = dependencies.now ?? Date.now;
        this.serializeSessionInfo = dependencies.serializeSessionInfo;
        this.defaultRedirectPath = dependencies.defaultRedirectPath ?? DEFAULT_REDIRECT_PATH;
    }

    async execute(input: BnetCallbackUseCaseInput): Promise<BnetCallbackResult> {
        if (!input.code) {
            return {
                type: 'redirect',
                url: this.defaultRedirectPath,
                reason: 'missing_code',
            };
        }

        const stateData = this.decodeState(input.state);
        const redirectFrom = this.resolveRedirectPath(stateData);
        const windowOpener = Boolean(stateData?.windowOpener);

        let tokenResponse;
        try {
            tokenResponse = await this.dependencies.bnetOAuthGateway.exchangeCode({
                code: input.code,
                redirectUri: this.dependencies.redirectUri,
            });
        } catch (error) {
            return {
                type: 'redirect',
                url: this.buildErrorUrl(input.origin, 'oauth_failed'),
                reason: 'bnet_oauth_failed',
                cause: error,
            };
        }

        let loginResponse;

        try {
            loginResponse = await this.dependencies.authGateway.loginWithProvider({
                provider: 'bnet',
                accessToken: tokenResponse.access_token,
                expiresAt: this.computeExpiresAt(tokenResponse.expires_in),
            });
        } catch (error) {
            return {
                type: 'redirect',
                url: this.buildErrorUrl(input.origin, 'auth_failed'),
                reason: 'auth_failed',
                cause: error,
            };
        }

        if (stateData?.linkAccount) {
            const { auth, accessToken } = await createServerSession();
            const session = await auth.getSession();

            if (!session || !accessToken) {
                console.error('No authenticated session found for linking Battle.net account');
                return {
                    type: 'redirect',
                    url: this.buildErrorUrl(input.origin, 'not_logged_in'),
                    reason: 'not_logged_in',
                };
            }
            const { evApiUrl } = getEnvironment();

            const linkResponse = await fetch(`${evApiUrl}/auth/link-oauth-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    provider: 'bnet',
                    accessToken: tokenResponse.access_token,
                    tokenExpiresAt: (Date.now() + tokenResponse.expires_in * 1000) / 1000,
                    refreshToken: ''
                })
            });

            if (!linkResponse.ok) {
                console.error('Linking Battle.net account failed');
                return {
                    type: 'redirect',
                    url: this.buildErrorUrl(input.origin, 'link_account_failed'),
                    reason: 'link_account_failed',
                };
            }

            if (windowOpener) {
                return {
                    type: 'window-opener',
                    reason: 'success',
                };
            }

            return {
                type: 'redirect',
                url: this.buildSuccessRedirect(input.origin, redirectFrom),
                reason: 'success',
            };
        }

        await this.dependencies.sessionStore.setRefreshToken(
            loginResponse.refreshToken,
            loginResponse.refreshTokenExpiry,
        );

        const encodedSessionInfo = await this.encodeAccessTokenPayload(loginResponse.accessToken);

        if (encodedSessionInfo) {
            await this.dependencies.sessionStore.saveSessionInfo(
                encodedSessionInfo,
                loginResponse.accessTokenExpiry,
            );
        }

        if (windowOpener) {
            return {
                type: 'window-opener',
                reason: 'success',
            };
        }

        return {
            type: 'redirect',
            url: this.buildSuccessRedirect(input.origin, redirectFrom),
            reason: 'success',
        };
    }

    private decodeState(state: string | null): CallbackState | null {
        if (!state) {
            return null;
        }

        try {
            const decoded = Buffer.from(state, 'base64').toString('utf-8');
            return JSON.parse(decoded) as CallbackState;
        } catch {
            return null;
        }
    }

    private resolveRedirectPath(state: CallbackState | null): string {
        const candidate = state?.redirectedFrom ?? this.defaultRedirectPath;
        if (typeof candidate !== 'string' || !candidate.startsWith('/')) {
            return this.defaultRedirectPath;
        }
        return candidate;
    }

    private buildErrorUrl(origin: string, errorKey: string): string {
        return `${origin}/?error=${encodeURIComponent(errorKey)}`;
    }

    private buildSuccessRedirect(origin: string, redirectPath: string): string {
        if (this.dependencies.isProduction) {
            return `${this.dependencies.productionOrigin}${redirectPath.replace(/^\//, '')}`;
        }

        return `${origin}${redirectPath}`;
    }

    private computeExpiresAt(expiresInSeconds: number): number {
        const nowMs = this.now();
        return Math.floor((nowMs + expiresInSeconds * 1000) / 1000);
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
}

function toBase64(value: string): string {
    return Buffer.from(value, 'utf-8').toString('base64');
}
