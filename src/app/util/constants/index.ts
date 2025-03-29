import {type Role} from "@/app/components/characterStore";

export const GUILD_REALM_SLUG = 'living-flame'
export const REALM_ID = 5827
export const GUILD_REALM_NAME = 'Living Flame'
export const EV_COOKIE_NAME = 'evToken'
export const BNET_COOKIE_NAME = 'bnetToken'
export const GUILD_ID = 2410263
export const GUILD_NAME = 'Everlasting Vendetta'
export const BLIZZARD_API_BASE_URL = 'https://eu.api.blizzard.com'
export const BLIZZARD_API_NAMESPACE = 'profile-classic1x-eu'
export const BLIZZARD_API_STATIC_NAMESPACE = 'static-1.15.6_58725-classic1x-eu'
export const BLIZZARD_API_LOCALE = 'en_US'
export const BLIZZARD_API_REGION = 'eu'
export const BLIZZARD_LOGOUT_URL = 'https://eu.battle.net/login/en/logout'
export const LOGIN_URL = '/api/v1/oauth/bnet/auth'
export const LOGIN_URL_TEMPORAL = '/api/v1/supabase/auth/temporal'
export const CURRENT_MAX_LEVEL = 60
export const REGISTRATION_SOURCES = {
    BNET_OAUTH: 'bnet_oauth',
    TEMPORAL: 'temporal',
    MANUAL_RESERVATION: 'manual_reservation'
}
//'tank' | 'healer' | 'dps' | 'tank-healer' | 'tank-dps' | 'healer-dps'
export const PLAYABLE_ROLES = {
    TANK: {value: 'tank', label: 'Tank'},
    HEALER: {value: 'healer', label: 'Healer'},
    DPS: {value: 'dps', label: 'DPS'},
    TANK_HEALER: {value: 'tank-healer', label: 'Tank/Healer'},
    TANK_DPS: {value: 'tank-dps', label: 'Tank/DPS'},
    HEALER_DPS: {value: 'healer-dps', label: 'Healer/DPS'},
} as {[key: string]: {value: Role, label: string}}

export const ROLE = {
    GUILD_MASTER: 'GUILD_MASTER',
    RAID_LEADER: 'RAID_LEADER',
    LOOT_MASTER: 'LOOT_MASTER',
    ADMIN: 'ADMIN',
    MODERATOR: 'MODERATOR',
    COMRADE: 'COMRADE',
    RAIDER: 'RAIDER',
    MEMBER: 'MEMBER',
    GUEST: 'GUEST',
    ALTER: 'ALTER',
}

export const ROLE_ORDER = [
    ROLE.ADMIN,
    ROLE.GUILD_MASTER,
    ROLE.RAID_LEADER,
    ROLE.MODERATOR,
    ROLE.COMRADE,
    ROLE.RAIDER,
    ROLE.MEMBER,
    ROLE.GUEST,
    ROLE.ALTER,
]

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

export const staticDefaultSearchParams: URLSearchParams = new URLSearchParams({
    namespace: BLIZZARD_API_STATIC_NAMESPACE,
    locale: BLIZZARD_API_LOCALE
})

export const createBlizzardItemFetchUrl = (itemId: number) => `${BLIZZARD_API_BASE_URL}/data/wow/item/${itemId}?namespace=${BLIZZARD_API_STATIC_NAMESPACE}&locale=${BLIZZARD_API_LOCALE}`
export const createProfileCharacterFetchUrl = (characterName: string) => `${BLIZZARD_API_BASE_URL}/profile/wow/character/${GUILD_REALM_SLUG}/${encodeURIComponent(characterName.toLowerCase())}?namespace=${BLIZZARD_API_NAMESPACE}&locale=${BLIZZARD_API_LOCALE}`
