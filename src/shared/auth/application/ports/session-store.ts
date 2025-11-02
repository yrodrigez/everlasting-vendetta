export interface RefreshTokenEntry {
    key: string;
    value: string;
}

export interface SessionStore {
    getRefreshToken(): RefreshTokenEntry | null;
    replaceRefreshToken(key: string, value: string, maxAge: number): Promise<void> | void;
    clearRefreshToken(key: string): Promise<void> | void;
    saveSessionInfo(value: string, maxAge: number): Promise<void> | void;
    setRefreshToken(value: string, maxAge: number): Promise<void> | void;
    getSessionInfo(): string | null;
    clear(): Promise<void> | void;
}
