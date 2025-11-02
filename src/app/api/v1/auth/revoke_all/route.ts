import { SessionManagementError } from '@/shared/auth/application/errors/session-management-error';
import { makeRevokeAllSessionsUseCase } from '@/shared/auth/factories/make-revoke-all-sessions-use-case';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const useCase = makeRevokeAllSessionsUseCase(cookieStore);
        const result = await useCase.execute({
            authorizationHeader: request.headers.get('Authorization'),
        });

        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof SessionManagementError) {
            const maybeCause = (error as { cause?: unknown }).cause ?? null;
            if (maybeCause) {
                console.error('Revoke all sessions failed', maybeCause);
            }
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }

        console.error('Revoke all sessions unexpected error', error);
        return NextResponse.json({ error: 'Failed to revoke all sessions' }, { status: 500 });
    }
}
