import {cookies} from "next/headers";
import {fetchGuildInfo} from "@/app/lib/fetchGuildInfo";
import {getBlizzardToken} from "@/app/lib/getBlizzardToken";
import {
    BLIZZARD_API_LOCALE,
    BLIZZARD_API_NAMESPACE,
    BLIZZARD_API_REGION,
    BNET_COOKIE_NAME,
    createProfileCharacterFetchUrl,
    GUILD_ID,
    GUILD_NAME,
    GUILD_REALM_SLUG,
    REALM_ID
} from "@/app/util/constants";

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

    getCharacterTalents(characterName: string): Promise<any>

    fetchEquipment(characterName: string): Promise<any>
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

    constructor({token}: { token?: { value: string } } = {}) {
        this.token = token?.value || cookies().get(BNET_COOKIE_NAME)?.value
        this.guild = GUILD_NAME!
        this.guildId = GUILD_ID
        this.region = BLIZZARD_API_REGION
        this.locale = BLIZZARD_API_LOCALE
        this.realmSlug = GUILD_REALM_SLUG
        this.realmId = REALM_ID
        this.namespace = BLIZZARD_API_NAMESPACE
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
            return {error: 'Character not found: ' + characterName}
        }
        const responseJson = await response.json()

        return responseJson
    }

    fetchCharacterStatistics = async (characterName: string) => {
        if (!characterName) {
            throw new Error('WoWService::fetchCharacterStatistics - characterName parameter is required')
        }
        const token = this.token ?? (await getBlizzardToken()).token
        const url = `https://eu.api.blizzard.com/profile/wow/character/${this.realmSlug}/${characterName}/statistics`
        const query = new URLSearchParams({
            namespace: this.namespace,
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
        const token = this.token
        if (!token) {
            return false
        }

        const [availableCharacters, guild] = await Promise.all([
            this.fetchBattleNetWoWAccounts(),
            fetchGuildInfo(token)
        ])

        if (availableCharacters?.length > 0) return true
        if (!guild || !guild.members || !availableCharacters) {
            return false
        }

        const currentRoster = guild.members
        return availableCharacters.some((character: any) => {
            if (currentRoster.some((member: any) => member.character.id === character.id)) {
                return true
            }
        })
    }

    getCharacterTalents = async (characterName: string) => {
        if (!characterName) {
            throw new Error('WoWService::getCharacterTalents - characterName parameter is required')
        }
        const url = `https://eu.api.blizzard.com/profile/wow/character/${this.realmSlug}/${characterName.toLowerCase()}/specializations`
        const queryParameters = new URLSearchParams({
            locale: this.locale,
            namespace: this.namespace
        })

        const token = this.token || (await getBlizzardToken()).token
        const response = await fetch(`${url}?${queryParameters.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        return await response.json()
    }

    fetchEquipment = async (characterName: string) => {
        if (!characterName) {
            throw new Error('WoWService::fetchEquipment - characterName parameter is required')
        }

        const url = `https://eu.api.blizzard.com/profile/wow/character/${this.realmSlug}/${characterName}/equipment`
        const query = new URLSearchParams({
            locale: this.locale,
            namespace: this.namespace
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
