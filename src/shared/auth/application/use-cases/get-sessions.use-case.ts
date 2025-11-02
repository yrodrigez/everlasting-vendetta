import type { SessionStore } from '../ports/session-store';
import type { AuthGateway } from '../ports/auth-gateway';
import { SessionManagementError } from '../errors/session-management-error';
import { extractBearerToken } from '../utils/extract-bearer-token';

export interface GetSessionsUseCaseInput {
    authorizationHeader: string | null;
}

export class GetSessionsUseCase {
    constructor(private readonly dependencies: { sessionStore: SessionStore; authGateway: AuthGateway }) {}

    async execute(input: GetSessionsUseCaseInput): Promise<unknown> {
        const refreshTokenEntry = this.dependencies.sessionStore.getRefreshToken();

        if (!refreshTokenEntry) {
            throw new SessionManagementError('No refresh token', 401);
        }

        const accessToken = extractBearerToken(input.authorizationHeader);

        if (!accessToken) {
            throw new SessionManagementError('No access token', 401);
        }

        try {
            return await this.dependencies.authGateway.listSessions({ accessToken });
        } catch (error) {
            const statusCode = resolveStatusCode(error, 502);
            throw new SessionManagementError('Failed to fetch sessions', statusCode, { cause: error });
        }
    }
}

function resolveStatusCode(error: unknown, fallback: number): number {
    const candidate = (error as { status?: unknown })?.status;
    return typeof candidate === 'number' ? candidate : fallback;
}
