import { RefreshSessionError } from '@/shared/auth/application/errors/refresh-session-error';
import { makeRefreshSessionUseCase } from '@/shared/auth/factories/make-refresh-session-use-case';
import { makeClearAllCookiesUseCase } from '@/shared/auth/factories/make-clear-all-cookies-use-case';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    console.log('Refresh route called');
    const cookieStore = await cookies();

    try {
        const refreshSessionUseCase = makeRefreshSessionUseCase(cookieStore);
        const result = await refreshSessionUseCase.execute();

        return NextResponse.json({
            accessToken: result.accessToken,
            shouldRefreshProviderToken: result.shouldRefreshProviderToken,
            redirectTo: result.redirectTo ?? null,
        });
    } catch (error) {
        const clearAllCookies = makeClearAllCookiesUseCase(cookieStore);
        await clearAllCookies.execute();
        if (error instanceof RefreshSessionError) {
            const maybeCause = (error as { cause?: unknown }).cause;
            if (maybeCause) {
                console.error('Token refresh failed', maybeCause);
            } else {
                console.error('Token refresh failed', error);
            }

            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }

        console.error('Token refresh failed', error);
        return NextResponse.json({ error: 'Refresh failed' }, { status: 500 });
    } finally {
        revalidatePath('/');
    }
}
