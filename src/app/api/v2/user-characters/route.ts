import { GUILD_REALM_SLUG } from '@/app/util/constants';
import { makeGetUserCharactersUseCase } from '@/shared/wow/factories/make-get-user-characters-use-case';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { GetUserCharactersError } from '@/shared/wow/application/errors/get-user-characters-error';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const realmSlug = requestUrl.searchParams.get('realmSlug') ?? GUILD_REALM_SLUG;

    try {
        const cookieStore = await cookies();
        const useCase = makeGetUserCharactersUseCase(cookieStore);
        const payload = await useCase.execute({
            authorizationHeader: request.headers.get('Authorization'),
            realmSlug,
        });

        return NextResponse.json(payload);
    } catch (error) {
        if (error instanceof GetUserCharactersError) {
            const maybeCause = (error as { cause?: unknown }).cause ?? null;
            if (maybeCause) {
                console.error('Get user characters failed', maybeCause);
            }
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }

        console.error('Get user characters unexpected error', error);
        return NextResponse.json({ error: 'Failed to fetch user characters' }, { status: 500 });
    }
}
