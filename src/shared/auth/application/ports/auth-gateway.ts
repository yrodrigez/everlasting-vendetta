export interface RefreshAuthResponse {
    accessToken: string;
    sessionId: string;
    expiresAt: number;
    accessTokenExpiresAt: number;
    provider?: string | null;
}

export interface LoginAuthResponse {
    sessionId: string;
    expiresAt: number;
    accessToken: string;
    accessTokenExpiresAt: number;
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
    refresh(params: { sessionId: string }): Promise<RefreshAuthResponse>;
    loginWithProvider(params: LoginWithProviderParams): Promise<LoginAuthResponse>;
    listSessions(params: ListSessionsParams): Promise<unknown>;
    revokeSession(params: RevokeSessionParams): Promise<{
            success: true,
            message: 'Token revoked successfully'
        }>;
    revokeAllSessions(params: RevokeAllSessionsParams): Promise<unknown>;
}
