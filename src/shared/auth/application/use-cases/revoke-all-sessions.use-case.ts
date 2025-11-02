import type { SessionStore } from '../ports/session-store';
import type { AuthGateway } from '../ports/auth-gateway';
import { SessionManagementError } from '../errors/session-management-error';
import { extractBearerToken } from '../utils/extract-bearer-token';

export interface RevokeAllSessionsUseCaseInput {
    authorizationHeader: string | null;
}

export class RevokeAllSessionsUseCase {
    constructor(private readonly dependencies: { sessionStore: SessionStore; authGateway: AuthGateway }) {}

    async execute(input: RevokeAllSessionsUseCaseInput): Promise<unknown> {
        const refreshTokenEntry = this.dependencies.sessionStore.getRefreshToken();

        if (!refreshTokenEntry) {
            throw new SessionManagementError('No refresh token', 401);
        }

        const accessToken = extractBearerToken(input.authorizationHeader);

        if (!accessToken) {
            throw new SessionManagementError('No access token', 401);
        }

        try {
            const result = await this.dependencies.authGateway.revokeAllSessions({ accessToken });
            await this.dependencies.sessionStore.clearRefreshToken(refreshTokenEntry.key);
            return result;
        } catch (error) {
            await this.dependencies.sessionStore.clearRefreshToken(refreshTokenEntry.key);
            const statusCode = resolveStatusCode(error, 502);
            throw new SessionManagementError('Failed to revoke all sessions', statusCode, { cause: error });
        }
    }
}

function resolveStatusCode(error: unknown, fallback: number): number {
    const candidate = (error as { status?: unknown })?.status;
    return typeof candidate === 'number' ? candidate : fallback;
}
