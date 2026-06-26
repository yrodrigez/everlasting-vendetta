import { EV_COOKIE_KEY_START, REFRESH_TOKEN_COOKIE_KEY } from '@/util/constants';
import { NextCookiesSessionStore } from '@/shared/auth/infrastructure/next-cookies-session-store';
import { ClearAllCookiesUseCase } from '@/shared/auth/application/use-cases/clear-all-cookies.use-case';

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

export function makeClearAllCookiesUseCase(cookieStore: CookieStore) {
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

    return new ClearAllCookiesUseCase({
        sessionStore,
    });
}
