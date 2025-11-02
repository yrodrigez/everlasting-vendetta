export interface RefreshAuthResponse {
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiry: number;
    accessTokenExpiry: number;
    shouldRefreshProviderToken: boolean;
    provider?: string | null;
}

export interface LoginAuthResponse {
    refreshToken: string;
    refreshTokenExpiry: number;
    accessToken: string;
    accessTokenExpiry: number;
}

export interface LoginWithProviderParams {
    provider: string;
    accessToken: string;
    expiresAt: number;
}

export interface ListSessionsParams {
    accessToken: string;
}

export interface RevokeSessionParams {
    accessToken: string;
    payload: Record<string, unknown>;
}

export interface RevokeAllSessionsParams {
    accessToken: string;
}

export interface AuthGateway {
    refresh(params: { refreshToken: string }): Promise<RefreshAuthResponse>;
    loginWithProvider(params: LoginWithProviderParams): Promise<LoginAuthResponse>;
    listSessions(params: ListSessionsParams): Promise<unknown>;
    revokeSession(params: RevokeSessionParams): Promise<{
            success: true,
            message: 'Token revoked successfully'
        }>;
    revokeAllSessions(params: RevokeAllSessionsParams): Promise<unknown>;
}
