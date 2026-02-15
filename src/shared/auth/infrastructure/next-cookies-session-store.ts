import type { SessionStore } from '../application/ports/session-store';

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
            expires?: Date;
        },
    ): void;
    delete(name: string): void;
};

interface NextCookiesSessionStoreConfig {
    refreshTokenCookieName: string;
    sessionInfoCookieName: string;
    selectedCharacterCookieName?: string;
    cookieOptions: {
        httpOnly: boolean;
        secure: boolean;
        sameSite: 'strict' | 'lax' | 'none';
        path: string;
        domain?: string;
    };
}

export class NextCookiesSessionStore implements SessionStore {
    constructor(private readonly cookies: CookieStore, private readonly config: NextCookiesSessionStoreConfig) { }
    clear(): void {
        this.expireCookie(this.config.refreshTokenCookieName);
        this.expireCookie(this.config.sessionInfoCookieName);
        if (this.config.selectedCharacterCookieName) {
            this.expireCookie(this.config.selectedCharacterCookieName);
        }
    }
    getSessionInfo(): string | null {
        const cookie = this.cookies.get(this.config.sessionInfoCookieName);

        if (!cookie?.value) {
            return null;
        }

        return cookie.value;
    }

    getRefreshToken() {
        const cookie = this.cookies.get(this.config.refreshTokenCookieName);

        if (!cookie?.value) {
            return null;
        }

        return { key: cookie.name, value: cookie.value };
    }

    async replaceRefreshToken(key: string, value: string, maxAge: number) {
        this.cookies.delete(key);
        this.setCookie(key, value, maxAge);
    }

    async setRefreshToken(value: string, maxAge: number) {
        const key = this.config.refreshTokenCookieName;
        this.cookies.delete(key);
        this.setCookie(key, value, maxAge);
    }

    async clearRefreshToken(key: string) {
        this.expireCookie(key);
    }

    async saveSessionInfo(value: string, maxAge: number) {
        const key = this.config.sessionInfoCookieName;
        this.cookies.delete(key);
        this.setCookie(key, value, maxAge);
    }

    private expireCookie(name: string) {
        this.cookies.set(name, '', {
            ...this.config.cookieOptions,
            maxAge: 0,
            expires: new Date(0),
        });
    }

    private setCookie(name: string, value: string, maxAge: number) {
        const normalizedMaxAge = Number.isFinite(maxAge) ? Math.max(0, Math.trunc(maxAge)) : undefined;
        this.cookies.set(name, value, {
            ...this.config.cookieOptions,
            //maxAge: normalizedMaxAge,
            expires: normalizedMaxAge ? new Date(normalizedMaxAge * 1000) : undefined,
        });
    }
}
