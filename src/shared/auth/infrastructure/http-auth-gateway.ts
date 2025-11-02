import type {
    AuthGateway,
    LoginAuthResponse,
    LoginWithProviderParams,
    ListSessionsParams,
    RevokeAllSessionsParams,
    RevokeSessionParams,
    RefreshAuthResponse,
} from '../application/ports/auth-gateway';

class HttpAuthGatewayError extends Error {
    readonly status: number;
    readonly payload?: string;

    constructor(message: string, status: number, payload?: string) {
        super(message);
        this.name = 'HttpAuthGatewayError';
        this.status = status;
        this.payload = payload;
    }
}

export class HttpAuthGateway implements AuthGateway {
    constructor(private readonly baseUrl: string) {
        if (!baseUrl) {
            throw new Error('HttpAuthGateway requires a baseUrl');
        }
    }

    async refresh(params: { refreshToken: string }): Promise<RefreshAuthResponse> {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            cache: 'no-store',
            body: JSON.stringify({ refresh_token: params.refreshToken }),
        });

        if (!response.ok) {
            const payload = await response.text().catch(() => undefined);
            throw new HttpAuthGatewayError('Token refresh failed', response.status, payload);
        }

        return response.json() as Promise<RefreshAuthResponse>;
    }

    async loginWithProvider(params: LoginWithProviderParams): Promise<LoginAuthResponse> {
        const response = await fetch(`${this.baseUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                provider: params.provider,
                access_token: params.accessToken,
                expires_at: params.expiresAt,
            }),
        });

        if (!response.ok) {
            const payload = await response.text().catch(() => undefined);
            throw new HttpAuthGatewayError('Auth login failed', response.status, payload);
        }

        return response.json() as Promise<LoginAuthResponse>;
    }

    async listSessions(params: ListSessionsParams): Promise<unknown> {
        const response = await fetch(`${this.baseUrl}/auth/sessions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${params.accessToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const payload = await response.text().catch(() => undefined);
            throw new HttpAuthGatewayError('Failed to fetch sessions', response.status, payload);
        }

        return response.json();
    }

    async revokeSession(params: RevokeSessionParams): Promise<{
            success: true,
            message: 'Token revoked successfully'
        }> {
        const response = await fetch(`${this.baseUrl}/auth/revoke`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${params.accessToken}`,
            },
            credentials: 'include',
            body: JSON.stringify(params.payload),
        });

        if (!response.ok) {
            const payload = await response.text().catch(() => undefined);
            throw new HttpAuthGatewayError('Failed to revoke session', response.status, payload);
        }

        return response.json();
    }

    async revokeAllSessions(params: RevokeAllSessionsParams): Promise<unknown> {
        const response = await fetch(`${this.baseUrl}/auth/revoke_all`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${params.accessToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const payload = await response.text().catch(() => undefined);
            throw new HttpAuthGatewayError('Failed to revoke all sessions', response.status, payload);
        }

        return response.json();
    }
}

export { HttpAuthGatewayError };
