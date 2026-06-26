'use server'
import { createAPIService, createServerApiClient, type StoredSelectedCharacter } from '@/lib/api'
import { makeRefreshSessionUseCase } from '@/shared/auth/factories/make-refresh-session-use-case'
import { GUILD_REALM_NAME, GUILD_REALM_SLUG } from '@/util/constants'
import { type SupabaseClient, createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import 'server-only'


type UserSelectedCharacter = {
    id: number
    name: string
    level: number
    avatar: string
    realmSlug: string
    role?: string
    selectedRole?: string
    class?: string
    guild?: {
        name?: string
        id?: number
    }
    realm?: StoredSelectedCharacter['realm']
}

export type UserProfile = {
    id: string
    roles: string[]
    permissions: string[]
    provider: 'bnet_oauth' | 'discord_oauth' | 'temporal'
    isTemporal: boolean
    isAdmin: boolean
    isBanned?: boolean
    selectedCharacter?: UserSelectedCharacter | null
    isGuildMember?: boolean
}

function normalizeSelectedCharacter(character: StoredSelectedCharacter | null): UserSelectedCharacter | null {
    if (!character) {
        return null;
    }

    const selectedRole = character.selectedRole;
    const characterClass = character.playable_class?.name ?? character.character_class?.name;
    const realmSlug = character.realm?.slug ?? GUILD_REALM_SLUG;
    const realm = {
        slug: realmSlug,
        name: character.realm?.name ?? GUILD_REALM_NAME,
    };

    return {
        id: character.id,
        name: character.name,
        level: character.level,
        avatar: character.avatar,
        realm,
        realmSlug,
        guild: character.guild,
        class: characterClass,
        role: selectedRole,
        selectedRole,
    };
}


async function getFreshAccessToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const mockedCookieStoreMethods = {
        get: (name: string) => {
            return cookieStore.get(name);
        },
        set: () => {
        },
        delete: () => {
        }
    }
    try {
        const refreshSessionUseCase = makeRefreshSessionUseCase({ ...mockedCookieStoreMethods });
        const result = await refreshSessionUseCase.execute();
        return result.accessToken ?? null;
    } catch (error) {
        console.error('Error refreshing session:', error);
        return null;
    }
}

export default async function createServerSession(): Promise<{
    getSupabase: () => Promise<SupabaseClient>;
    auth: { getSession: () => Promise<UserProfile | undefined> }
    didSsrRefresh?: boolean
    ssrRefreshedAt?: number
    accessToken: string | undefined
    apiService: ReturnType<typeof createAPIService>
}> {

    const accessToken = await getFreshAccessToken();

    const getSupabase = async () => {
        if (!accessToken) {
            return createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            );
        }
        const client = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: { headers: { Authorization: `Bearer ${accessToken}` } },
                accessToken: () => Promise.resolve(accessToken),
            }
        );

        client.realtime.setAuth(accessToken);

        return client;
    }

    const api = createServerApiClient(accessToken);
    const apiService = createAPIService(api);
    if (!accessToken) {
        return {
            apiService,
            getSupabase,
            auth: {
                getSession: async () => undefined,
            },
            accessToken: accessToken ?? undefined
        }
    }


    const selectedCharacter = normalizeSelectedCharacter(await apiService.characters.getSelected());
    const sessionInfo = JSON.parse(Buffer.from((accessToken?.split?.('.')[1]) ?? '', 'base64url').toString('utf8'));
    async function getSession(): Promise<UserProfile> {
        const memberId = sessionInfo.sub
        const { custom_roles: roles, permissions, isTemporal, isAdmin, isBanned, provider, isGuildMember } = sessionInfo

        return {
            id: memberId,
            roles,
            permissions,
            isTemporal,
            isAdmin,
            isBanned,
            provider,
            isGuildMember,
            ...(selectedCharacter ? { selectedCharacter } : {}),
        }
    }


    return { getSupabase, auth: { getSession }, accessToken: accessToken ?? undefined, apiService };
}
