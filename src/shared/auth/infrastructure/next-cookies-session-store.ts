import type { SessionStore } from '@/shared/auth/application/ports/session-store';

type CookieStore = {
    get(name: string): { name: string; value: string } | undefined;
    getAll?(): { name: string; value: string }[];
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
    cookieNamePrefixes?: string[];
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
        const cookieNames = new Set<string>([this.config.refreshTokenCookieName]);

        const prefixes = this.config.cookieNamePrefixes ?? [];
        for (const cookie of this.cookies.getAll?.() ?? []) {
            if (prefixes.some(prefix => cookie.name.startsWith(prefix))) {
                cookieNames.add(cookie.name);
            }
        }

        for (const name of cookieNames) {
            this.expireCookie(name);
        }
    }

    getRefreshToken() {
        const cookie = this.cookies.get(this.config.refreshTokenCookieName);

        if (!cookie?.value) {
            return null;
        }

        return { key: cookie.name, value: cookie.value };
    }

    async replaceRefreshToken(key: string, value: string, maxAge: number) {
        if (!value) {
            throw new Error('Refresh token value cannot be empty');
        }
        this.cookies.delete(key);
        this.setCookie(key, value, maxAge);
    }

    async setRefreshToken(value: string, maxAge: number) {
        if (!value) {
            throw new Error('Refresh token value cannot be empty');
        }
        const key = this.config.refreshTokenCookieName;
        this.cookies.delete(key);
        this.setCookie(key, value, maxAge);
    }

    async clearRefreshToken(key: string) {
        this.expireCookie(key);
    }

    private expireCookie(name: string) {
        const domains = new Set<string | undefined>([
            undefined,
            this.config.cookieOptions.domain,
            process.env.NODE_ENV === 'production' ? '.everlastingvendetta.com' : undefined,
            process.env.NODE_ENV === 'production' ? 'everlastingvendetta.com' : undefined,
        ]);

        for (const domain of domains) {
            this.cookies.set(name, '', {
                ...this.config.cookieOptions,
                domain,
                maxAge: 0,
                expires: new Date(0),
            });
        }
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
