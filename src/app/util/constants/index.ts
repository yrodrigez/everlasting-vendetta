export const GUILD_REALM_SLUG = 'lone-wolf'
export const REALM_ID = 5826
export const GUILD_REALM_NAME = 'Lone Wolf'
export const EV_COOKIE_NAME = 'evToken'
export const BNET_COOKIE_NAME = 'bnetToken'
export const GUILD_ID = 2239011
export const GUILD_NAME = 'Everlasting Vendetta'
export const BLIZZARD_API_BASE_URL = 'https://eu.api.blizzard.com'
export const BLIZZARD_API_NAMESPACE = 'profile-classic1x-eu'
export const BLIZZARD_API_LOCALE = 'en_US'
export const BLIZZARD_API_REGION = 'eu'
export const BLIZZARD_LOGOUT_URL = 'https://eu.battle.net/login/en/logout'
export const LOGIN_URL = '/api/v1/oauth/bnet/auth'

/**
 * Default search params for Blizzard API requests
 * @type {URLSearchParams}
 * @example
 * const url = `${BLIZZARD_API_BASE_URL}/profile/user/wow?${defaultSearchParams}`
 */
export const defaultSearchParams: URLSearchParams = new URLSearchParams({
    namespace: BLIZZARD_API_NAMESPACE,
    locale: BLIZZARD_API_LOCALE
})
