import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { RefreshSessionError } from '@/shared/auth/application/errors/refresh-session-error';
import { makeRefreshSessionUseCase } from '@/shared/auth/factories/make-refresh-session-use-case';
import { revalidatePath } from 'next/cache';

export async function POST(_: NextRequest) {
    const cookieStore = await cookies();
    const refreshSessionUseCase = makeRefreshSessionUseCase(cookieStore);

    try {
        const result = await refreshSessionUseCase.execute();

        if (result.redirectTo) {
            return NextResponse.redirect(result.redirectTo);
        }

        return NextResponse.json({
            accessToken: result.accessToken,
            shouldRefreshProviderToken: result.shouldRefreshProviderToken,
        });
    } catch (error) {
        if (error instanceof RefreshSessionError) {
            const maybeCause = (error as { cause?: unknown }).cause;
            if (maybeCause) {
                console.error('Token refresh failed', maybeCause);
            }
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }

        console.error('Token refresh failed', error);
        return NextResponse.json({ error: 'Refresh failed' }, { status: 500 });
    } finally {
        revalidatePath('/');
    }
}
