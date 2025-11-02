import { REFRESH_TOKEN_COOKIE_KEY, SELECTED_CHARACTER_COOKIE_KEY, SESSION_INFO_COOKIE_KEY } from '@/app/util/constants';
import { NextCookiesSessionStore } from '../infrastructure/next-cookies-session-store';
import { HttpAuthGateway } from '../infrastructure/http-auth-gateway';
import { RevokeSessionUseCase } from '../application/use-cases/revoke-session.use-case';

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

export function makeRevokeSessionUseCase(cookieStore: CookieStore) {
    const apiUrl = process.env.NEXT_PUBLIC_EV_API_URL;

    if (!apiUrl) {
        throw new Error('NEXT_PUBLIC_EV_API_URL is not set');
    }

    const domain = process.env.NODE_ENV === 'production' ? '.everlastingvendetta.com' : 'localhost';

    const sessionStore = new NextCookiesSessionStore(cookieStore, {
        selectedCharacterCookieName: SELECTED_CHARACTER_COOKIE_KEY,
        refreshTokenCookieName: REFRESH_TOKEN_COOKIE_KEY,
        sessionInfoCookieName: SESSION_INFO_COOKIE_KEY,
        cookieOptions: {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/',
            domain,
        },
    });

    const authGateway = new HttpAuthGateway(apiUrl);

    return new RevokeSessionUseCase({
        sessionStore,
        authGateway,
    });
}
