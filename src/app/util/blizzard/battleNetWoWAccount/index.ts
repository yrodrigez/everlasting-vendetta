import {Character, FetchBattleNetApiResponse} from "@/app/util/blizzard/battleNetWoWAccount/types";
import {
    BLIZZARD_API_BASE_URL,
    defaultSearchParams,
    GUILD_REALM_SLUG
} from "@/app/util/constants";

/**
 * Fetch battle.net profile
 * @see https://develop.battle.net/documentation/world-of-warcraft/profile-apis
 * @see https://develop.battle.net/documentation/world-of-warcraft/profile-apis/user-profile
 *
 * @param token - Battle.net access token
 * @returns {Promise<FetchBattleNetApiResponse>}
 * @throws {Error} - If token is not provided
 * @throws {Error} - If response is not ok
 * @example
 * const bnetProfile = await fetchBattleNetProfile(token)
 */
export async function fetchBattleNetProfile(token: string): Promise<FetchBattleNetApiResponse> {
    if (!token) throw new Error('fetchBattleNetProfile - token parameter is required')

    const url = `${BLIZZARD_API_BASE_URL}/profile/user/wow?${defaultSearchParams}` //
    const headers = new Headers()
    headers.append('Authorization', 'Bearer ' + token)

    const response = await fetch(url, {
        method: 'GET',
        headers: headers,
    });

    if (!response.ok) {
        console.error('Error fetching battle.net profile', response.status, response.statusText)
        throw new Error('Error fetching battle.net profile')
    }

    return await response.json();
}

/**
 * Fetch realm characters
 * @see https://develop.battle.net/documentation/world-of-warcraft/profile-apis/character-profile
 * @param token - Battle.net access token
 * @returns {Promise<Character[]>}
 * @throws {Error} - If token is not provided
 * @example
 * const characters = await getRealmCharacters({token})
 *
 */
export async function getRealmCharacters({token}: {
    token: string
}) {
    if (!token) {
        throw new Error('fetchBattleNetWoWAccounts - token parameter is required')
    }

    const bnetProfile = await fetchBattleNetProfile(token)
    const wowAccounts = bnetProfile.wow_accounts

    let characters = [] as Character[]
    const realmSlug = GUILD_REALM_SLUG
    for (let account of wowAccounts) {
        const serverCharacters = account.characters.filter((character) => {
            return character.realm.slug === realmSlug
        })
        characters = characters.concat(serverCharacters)
    }

    return characters
}
