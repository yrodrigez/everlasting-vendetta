import { EV_COOKIE_KEY_START, REFRESH_TOKEN_COOKIE_KEY } from '@/util/constants';
import { BnetCallbackUseCase } from '@/shared/auth//application/use-cases/bnet-callback.use-case';
import { BattleNetOAuthGateway } from '@/shared/auth/infrastructure/bnet-oauth-gateway';
import { HttpAuthGateway } from '@/shared/auth/infrastructure/http-auth-gateway';
import { NextCookiesSessionStore } from '@/shared/auth/infrastructure/next-cookies-session-store';

type CookieStore = {
    get(name: string): { name: string; value: string } | undefined;
    set(
        name: string,
        value: string,
        options: {
            httpOnly?: boolean;
            secure?: boolean;
            sameSite?: 'strict' | 'lax' | 'none';
            path?: string;
            domain?: string;
            maxAge?: number;
        },
    ): void;
    delete(name: string): void;
};

export function makeBnetCallbackUseCase(cookieStore: CookieStore) {
    const apiUrl = process.env.NEXT_PUBLIC_EV_API_URL;
    const clientId = process.env.BNET_CLIENT_ID;
    const clientSecret = process.env.BNET_CLIENT_SECRET;
    const redirectUri = process.env.BNET_REDIRECT_URI;

    if (!apiUrl) {
        throw new Error('NEXT_PUBLIC_EV_API_URL is not set');
    }

    if (!clientId) {
        throw new Error('BNET_CLIENT_ID is not set');
    }

    if (!clientSecret) {
        throw new Error('BNET_CLIENT_SECRET is not set');
    }

    if (!redirectUri) {
        throw new Error('BNET_REDIRECT_URI is not set');
    }

    const domain = process.env.NODE_ENV === 'production' ? '.everlastingvendetta.com' : 'localhost';

    const sessionStore = new NextCookiesSessionStore(cookieStore, {
        refreshTokenCookieName: REFRESH_TOKEN_COOKIE_KEY,
        cookieNamePrefixes: [EV_COOKIE_KEY_START],
        cookieOptions: {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/',
            domain,
        },
    });

    const authGateway = new HttpAuthGateway(apiUrl);
    const bnetOAuthGateway = new BattleNetOAuthGateway(clientId, clientSecret);

    const productionOrigin = process.env.PRODUCTION_ORIGIN ?? 'https://www.everlastingvendetta.com/';

    return new BnetCallbackUseCase({
        sessionStore,
        authGateway,
        bnetOAuthGateway,
        redirectUri,
        isProduction: process.env.NODE_ENV === 'production',
        productionOrigin,
    });
}
