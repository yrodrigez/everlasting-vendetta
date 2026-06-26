import { SessionManagementError } from '@/shared/auth/application/errors/session-management-error';
import { makeClearAllCookiesUseCase } from '@/shared/auth/factories/make-clear-all-cookies-use-case';
import { makeRevokeSessionUseCase } from '@/shared/auth/factories/make-revoke-session-use-case';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const body = await request.clone().json().catch(() => null);
    const shouldClearLocalSession = !body?.token_jti;

    try {
        const useCase = makeRevokeSessionUseCase(cookieStore);
        const result = await useCase.execute({
            authorizationHeader: request.headers.get('Authorization'),
        });

        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof SessionManagementError) {
            const maybeCause = (error as { cause?: unknown }).cause ?? null;
            if (maybeCause) {
                console.error('Revoke session failed', maybeCause);
            }
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }

        console.error('Revoke session unexpected error', error);
        return NextResponse.json({ error: 'Failed to revoke session' }, { status: 500 });
    } finally {
        if (shouldClearLocalSession) {
            await makeClearAllCookiesUseCase(cookieStore).execute();
        }
        revalidatePath('/');   // Optionally revalidate paths or tags if needed
    }
}
