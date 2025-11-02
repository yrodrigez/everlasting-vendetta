import type { SessionStore } from '../ports/session-store';
import type { AuthGateway } from '../ports/auth-gateway';
import { SessionManagementError } from '../errors/session-management-error';
import { extractBearerToken } from '../utils/extract-bearer-token';
import { decodeJwtPayload } from '../utils/decode-jwt-payload';

export interface RevokeSessionUseCaseInput {
    authorizationHeader: string | null;
}

export class RevokeSessionUseCase {
    constructor(private readonly dependencies: { sessionStore: SessionStore; authGateway: AuthGateway }) { }

    async execute(input: RevokeSessionUseCaseInput): Promise<unknown> {
        const refreshTokenEntry = this.dependencies.sessionStore.getRefreshToken();

        if (!refreshTokenEntry) {
            throw new SessionManagementError('No refresh token', 401);
        }

        const accessToken = extractBearerToken(input.authorizationHeader);

        if (!accessToken) {
            throw new SessionManagementError('No access token', 401);
        }

        const decoded = decodeJwtPayload(refreshTokenEntry.value);
        const currentJti = getStringProperty(decoded, 'jti');


        try {
            const response = await this.dependencies.authGateway.revokeSession({
                accessToken,
                payload: { 'token_jti': currentJti },
            });

            if (response.success) {
                this.dependencies.sessionStore.clear();
            }

            return response;
        } catch (error) {
            const statusCode = resolveStatusCode(error, 502);
            throw new SessionManagementError('Failed to revoke session', statusCode, { cause: error });
        }
    }
}

function resolveStatusCode(error: unknown, fallback: number): number {
    const candidate = (error as { status?: unknown })?.status;
    return typeof candidate === 'number' ? candidate : fallback;
}

function getStringProperty(source: Record<string, unknown> | null, key: string): string | null {
    if (!source) {
        return null;
    }

    const candidate = source[key];
    return typeof candidate === 'string' ? candidate : null;
}
