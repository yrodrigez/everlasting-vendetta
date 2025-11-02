import { NextCookiesSessionStore } from '@/shared/auth/infrastructure/next-cookies-session-store';
import { REFRESH_TOKEN_COOKIE_KEY, SESSION_INFO_COOKIE_KEY } from '@/app/util/constants';
import { GetUserCharactersUseCase } from '../application/use-cases/get-user-characters.use-case';
import { EvWowGateway } from '../infrastructure/ev-wow-gateway';

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

export function makeGetUserCharactersUseCase(cookieStore: CookieStore) {
    const apiUrl = process.env.NEXT_PUBLIC_EV_API_URL;

    if (!apiUrl) {
        throw new Error('NEXT_PUBLIC_EV_API_URL is not set');
    }

    const domain = process.env.NODE_ENV === 'production' ? '.everlastingvendetta.com' : 'localhost';

    const sessionStore = new NextCookiesSessionStore(cookieStore, {
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

    const wowGateway = new EvWowGateway(apiUrl);

    return new GetUserCharactersUseCase({
        sessionStore,
        wowGateway,
    });
}
