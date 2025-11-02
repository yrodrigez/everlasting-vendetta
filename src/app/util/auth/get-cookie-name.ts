import { REFRESH_TOKEN_COOKIE_KEY } from "../constants";

export function getRefreshTokenKey(cookieStore: { getAll: () => { name: string; value: string }[] }) {
    const refreshTokenKey = Object.keys(cookieStore.getAll().reduce((acc: Record<string, string>, cookie: { name: string; value: string }) => {
        if (cookie.name === REFRESH_TOKEN_COOKIE_KEY) {
            acc[cookie.name] = cookie.value;
        }
        return acc;
    }, {} as Record<string, string>))[0];
    
    return refreshTokenKey;
}