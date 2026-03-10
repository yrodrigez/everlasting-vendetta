import { encrypt } from '@/util/auth/crypto';
import { REFRESH_TOKEN_COOKIE_KEY, SESSION_INFO_COOKIE_KEY } from '@/util/constants';
import type { Encryptor } from '@/shared/auth/application/ports/encryptor';
import { RefreshSessionUseCase } from '@/shared/auth/application/use-cases/refresh-session.use-case';
import { HttpAuthGateway } from '@/shared/auth/infrastructure/http-auth-gateway';
import { NextCookiesSessionStore } from '@/shared/auth/infrastructure/next-cookies-session-store';
import { getEnvironment } from '@/infrastructure/environment';

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

export function makeRefreshSessionUseCase(cookieStore: CookieStore) {
    const { evApiUrl } = getEnvironment();

    if (!evApiUrl) {
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

    const encryptor: Encryptor<{ iv: string; ciphertext: string }> = {
        encrypt: (value) => encrypt(value),
    };

    const authGateway = new HttpAuthGateway(evApiUrl);

    return new RefreshSessionUseCase({
        sessionStore,
        authGateway,
        encryptor,
    });
}
