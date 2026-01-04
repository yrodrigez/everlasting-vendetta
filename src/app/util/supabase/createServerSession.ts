'use server'
import { SelectedCharacterCookieDTO } from '@/app/components/characterStore'
import { type SupabaseClient, createClient } from '@supabase/supabase-js'
import { cookies, headers } from 'next/headers'
import 'server-only'
import { decrypt } from '../auth/crypto'
import { REFRESH_TOKEN_COOKIE_KEY, SELECTED_CHARACTER_COOKIE_KEY, SESSION_INFO_COOKIE_KEY } from '../constants'
import { createAPIService, createServerApiClient } from '@/app/lib/api'


export type UserProfile = {
    id: string
    roles: string[]
    permissions: string[]
    provider: 'bnet_oauth' | 'discord_oauth' | 'temporal'
    isTemporal: boolean
    isAdmin: boolean
    isBanned?: boolean
    selectedCharacter?: SelectedCharacterCookieDTO | null
    isGuildMember?: boolean
}

async function getFreshAccessToken(): Promise<string | null> {
    const cookieStore = await cookies()
    const refreshCookie = cookieStore.get(REFRESH_TOKEN_COOKIE_KEY)
    if (!refreshCookie) {
        console.log('[getFreshAccessToken] No refresh cookie found')
        return null
    }
    const refreshToken = refreshCookie.value
    if (!refreshToken) {
        console.log('[getFreshAccessToken] Refresh cookie empty')
        return null
    }

    const headersStore = await headers()
    const accessToken = headersStore.get('x-ev-access')
    return accessToken
}

export default async function createServerSession(): Promise<{
    getSupabase: () => Promise<SupabaseClient>;
    auth: { getSession: () => Promise<UserProfile | undefined> }
    didSsrRefresh?: boolean
    ssrRefreshedAt?: number
    accessToken: string | undefined
    apiService: ReturnType<typeof createAPIService>
}> {

    const cookiesStore = await cookies()
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

    const sessionInfoVal = cookiesStore.get(SESSION_INFO_COOKIE_KEY)?.value
    if (!sessionInfoVal) {
        return {
            apiService,
            getSupabase,
            auth: {
                getSession: async () => undefined,
            },
            accessToken: accessToken ?? undefined
        }
    }

    const selectedCharval = cookiesStore.get(SELECTED_CHARACTER_COOKIE_KEY)?.value
    const selectedCharacter: SelectedCharacterCookieDTO | null = (() => {
        if (!selectedCharval) return null
        return JSON.parse(Buffer.from(selectedCharval, 'base64url').toString('utf8'))
    })()

    const decodedSessionInfo = Buffer.from(sessionInfoVal, 'base64url').toString('utf8');
    const decrypted = await decrypt(JSON.parse(decodedSessionInfo));
    const sessionInfo = JSON.parse(Buffer.from(decrypted, 'base64url').toString('utf8'));
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
