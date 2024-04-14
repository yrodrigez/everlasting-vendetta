import {cookies} from "next/headers";
import {fetchGuildInfo} from "@/app/lib/fetchGuildInfo";
import {getBlizzardToken} from "@/app/lib/getBlizzardToken";

interface WoWService {
    token: string | undefined
    guild: string
    guildId: string
    region: string
    locale: string
    realmSlug: string
    realmId: string
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
    guildId: string;
    region: string;
    locale: string;
    realmSlug: string;
    realmId: string;
    headers: Headers;
    namespace: string;

    constructor() {
        this.token = cookies().get(process.env.BNET_COOKIE_NAME!)?.value
        this.guild = process.env.GUILD_NAME!
        this.guildId = process.env.GUILD_ID!
        this.region = process.env.GUILD_REGION!
        this.locale = 'en_US'
        this.realmSlug = process.env.GUILD_REALM_SLUG!
        this.realmId = process.env.GUILD_REALM_ID!
        this.namespace = 'profile-classic1x-eu'
        const headers = new Headers()
        headers.append('Authorization', 'Bearer ' + this.token)
        this.headers = headers
    }

    fetchMemberInfo = async (characterName: string) => {
        if (!characterName) {
            throw new Error('WoWService::fetchMemberInfo - characterName parameter is required')
        }
        const token = this.token ?? (await getBlizzardToken()).token
        const url = `https://eu.api.blizzard.com/profile/wow/character/${this.realmSlug}/${characterName.toLowerCase()}`;
        const query = new URLSearchParams({
            locale: this.locale,
            namespace: this.namespace
        })

        const response = await fetch(`${url}?${query}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        const data = await response.json()

        return data
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

            return data?.wow_accounts[0]?.characters || []
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
