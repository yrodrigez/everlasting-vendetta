import { getBlizzardToken } from "@/app/lib/getBlizzardToken";
import {
    BLIZZARD_API_LOCALE,
    BLIZZARD_API_NAMESPACE,
    BLIZZARD_API_REGION,
    createProfileCharacterFetchUrl,
    GUILD_ID,
    GUILD_NAME,
    GUILD_REALM_SLUG,
    REALM_ID
} from "@/app/util/constants";
import createServerSession from "@utils/supabase/createServerSession";

interface WoWService {
    token: string | undefined
    guild: string
    guildId: number
    region: string
    locale: string
    realmSlug: string
    realmId: number
    headers: Headers
    namespace: string

    fetchBattleNetWoWAccounts(): Promise<any[]>

    isLoggedUserInGuild(): Promise<boolean>

    getCharacterTalents(characterName: string, realmSlug: string): Promise<any>

    fetchEquipment(characterName: string, realmSlug: string): Promise<any>
}


const region = process.env.BLIZZARD_REGION || 'eu';
const locale = process.env.BLIZZARD_LOCALE || 'en_US';
const classicEraNamespaces = [
    { type: 'profile', namespace: `profile-classic1x-${region}` },
    { type: 'static', namespace: `static-classic1x-${region}` },
    { type: 'dynamic', namespace: `dynamic-classic1x-${region}` },
];
const classicAnniversaryNamespaces = [
    { type: 'profile', namespace: `profile-classicann-${region}` },
    { type: 'static', namespace: `static-classicann-${region}` },
    { type: 'dynamic', namespace: `dynamic-classicann-${region}` },
];


const currentRealms = [
    {
        slug: 'living-flame', namespaces: classicEraNamespaces
    },
    {
        slug: 'spineshatter', namespaces: classicAnniversaryNamespaces
    }
];

export function findNamespace(realmSlug: string, type: 'profile' | 'static' | 'dynamic'): string | null {
    const realm = currentRealms.find(r => r.slug === realmSlug.toLowerCase());
    if (!realm) return null;
    const namespaceObj = realm.namespaces.find(n => n.type === type);
    return namespaceObj ? namespaceObj.namespace : null;
}



export default class WoWService_Impl implements WoWService {
    token: string | undefined;
    guild: string;
    guildId: number;
    region: string;
    locale: string;
    realmSlug: string;
    realmId: number;
    headers: Headers;
    namespace: string;

    constructor({ token }: { token?: { value: string } } = {}) {
        this.token = token?.value
        this.guild = GUILD_NAME!
        this.guildId = GUILD_ID
        this.region = BLIZZARD_API_REGION
        this.locale = BLIZZARD_API_LOCALE
        this.realmSlug = GUILD_REALM_SLUG
        this.realmId = REALM_ID
        this.namespace = findNamespace(this.realmSlug, 'profile') || BLIZZARD_API_NAMESPACE
        const headers = new Headers()
        headers.append('Authorization', 'Bearer ' + this.token)
        this.headers = headers
    }

    fetchMemberInfo = async (characterName: string) => {
        if (!characterName) {
            throw new Error('WoWService::fetchMemberInfo - characterName parameter is required')
        }
        const token = this.token ?? (await getBlizzardToken()).token
        const url = createProfileCharacterFetchUrl(characterName);

        const response = await fetch(`${url}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        if (!response.ok) {
            return { error: 'Character not found: ' + characterName }
        }
        const responseJson = await response.json()

        return responseJson
    }

    fetchCharacterStatistics = async (characterName: string, realmSlug: string) => {
        if (!characterName) {
            throw new Error('WoWService::fetchCharacterStatistics - characterName parameter is required')
        }
        const token = this.token ?? (await getBlizzardToken()).token
        const url = `https://eu.api.blizzard.com/profile/wow/character/${realmSlug}/${characterName}/statistics`
        const namespace = findNamespace(realmSlug, 'profile') || this.namespace
        const query = new URLSearchParams({
            namespace: namespace,
            locale: this.locale
        })


        try {
            const response = await fetch(`${url}?${query}`, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
            return response.json()
        } catch (e) {
            console.error('Error fetching character statistics:', e)
            return {}
        }
    }

    fetchBattleNetWoWAccounts = async () => {
        this.token = this.token || (await getBlizzardToken()).token
        if (!this.token) {
            return []
        }
        const url = 'https://eu.api.blizzard.com/profile/user/wow'
        const query = new URLSearchParams({
            namespace: this.namespace,
            locale: this.locale
        })

        try {
            const response = await fetch(`${url}?${query}`, {
                headers: this.headers
            });

            const data = await response.json();

            return (data.wow_accounts ?? []).reduce((acc: any[], wowAccount: any) => {
                return [...acc, ...(wowAccount?.characters ?? [])]
            }, [])
        } catch (e) {
            console.error('Error fetching wow accounts:', e)
            return []
        }
    }

    isLoggedUserInGuild = async () => {
        const { auth } = await createServerSession();
        const session = await auth.getSession()
        console.log('WoWService::isLoggedUserInGuild - session:', session)
        if (!session) {
            return false
        }

        return !!session.isGuildMember
    }

    getCharacterTalents = async (characterName: string, realmSlug: string) => {
        if (!characterName) {
            throw new Error('WoWService::getCharacterTalents - characterName parameter is required')
        }
        const url = `https://eu.api.blizzard.com/profile/wow/character/${realmSlug}/${characterName.toLowerCase()}/specializations`
        const queryParameters = new URLSearchParams({
            locale: this.locale,
            namespace: findNamespace(realmSlug, 'profile') || this.namespace
        })

        const token = this.token || (await getBlizzardToken()).token
        const response = await fetch(`${url}?${queryParameters.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            console.error('Error fetching character talents:', response.status, response.statusText, await response.text())
            return {}
        }

        return await response.json()
    }

    fetchEquipment = async (characterName: string, realmSlug: string) => {
        if (!characterName) {
            throw new Error('WoWService::fetchEquipment - characterName parameter is required')
        }

        const url = `https://eu.api.blizzard.com/profile/wow/character/${realmSlug}/${characterName}/equipment`
        const query = new URLSearchParams({
            locale: this.locale,
            namespace: findNamespace(realmSlug, 'profile') || this.namespace
        })

        const token = this.token || (await getBlizzardToken()).token
        const response = await fetch(`${url}?${query}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })

        return response.json()
    }
}
