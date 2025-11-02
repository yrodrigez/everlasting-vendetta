import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { makeBnetCallbackUseCase } from '@/shared/auth/factories/make-bnet-callback-use-case';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);

    try {
        const cookieStore = await cookies();
        const useCase = makeBnetCallbackUseCase(cookieStore);
        const code = requestUrl.searchParams.get('code');
        const state = requestUrl.searchParams.get('state');

        const result = await useCase.execute({
            code,
            state,
            origin: requestUrl.origin,
        });

        if (result.type === 'window-opener') {
            return new NextResponse(
                `<script>
                    window.opener.postMessage({
                        type: 'AUTH_SUCCESS'
                    }, '*');
                    window.close();
                </script>`,
                {
                    headers: {
                        'Content-Type': 'text/html',
                    },
                },
            );
        }

        if (result.reason !== 'success') {
            console.error('Battle.net callback failed', result.reason, result.cause ?? null);
        }

        return NextResponse.redirect(result.url);
    } catch (error) {
        console.error('Battle.net callback unexpected error', error);
        return NextResponse.redirect(`${requestUrl.origin}/?error=oauth_unexpected_failure`);
    }
}
