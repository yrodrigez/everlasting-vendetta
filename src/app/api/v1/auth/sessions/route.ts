import { SessionManagementError } from '@/shared/auth/application/errors/session-management-error';
import { makeGetSessionsUseCase } from '@/shared/auth/factories/make-get-sessions-use-case';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const useCase = makeGetSessionsUseCase(cookieStore);
        const sessions = await useCase.execute({
            authorizationHeader: request.headers.get('Authorization'),
        });

        return NextResponse.json(sessions);
    } catch (error) {
        if (error instanceof SessionManagementError) {
            const maybeCause = (error as { cause?: unknown }).cause ?? null;
            if (maybeCause) {
                console.error('Get sessions failed', maybeCause);
            }
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }

        console.error('Get sessions unexpected error', error);
        return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }
}
