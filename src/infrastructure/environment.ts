
const ROLES = {
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

const COOKIE_VERSION = 'v97e5518e46ad';
export const getEnvironment = () => {
    return Object.freeze({
        // Public
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        evApiUrl: process.env.NEXT_PUBLIC_EV_API_URL || '',
        evAnonToken: process.env.NEXT_PUBLIC_EV_ANON_TOKEN || '',

        // server only
        // bnet
        bnetClientId: process.env.BNET_CLIENT_ID || '',
        bnetClientSecret: process.env.BNET_CLIENT_SECRET || '',
        bnetRedirectUri: process.env.BNET_REDIRECT_URI || '',
        // discord
        discordClientId: process.env.DISCORD_CLIENT_ID || '',
        discordClientSecret: process.env.DISCORD_CLIENT_SECRET || '',
        discordRedirectUri: process.env.DISCORD_REDIRECT_URI || '',
        discordLoginUrl: process.env.DISCORD_LOGIN_URL || '',
        // encryption
        encryptionKey: process.env.ENCRYPTION_KEY || '',

        // constants
        registrationSources: {
            BNET_OAUTH: 'bnet_oauth',
            DISCORD_OAUTH: 'discord_oauth',
            TEMPORAL: 'temporal',
            MANUAL_RESERVATION: 'manual_reservation'
        },

        // cookies & session
        cookieVersion: COOKIE_VERSION,
        refreshTokenCookieKey: `__ev_refresh_${COOKIE_VERSION}__`,
        selectedCharacterCookieKey: `__ev_selected_character_${COOKIE_VERSION}__`,
        sessionInfoCookieKey: `__ev_session_info_${COOKIE_VERSION}__`,

        playableRoles: {
            TANK: { value: 'tank', label: 'Tank' },
            HEALER: { value: 'healer', label: 'Healer' },
            DPS: { value: 'dps', label: 'DPS' },
            TANK_HEALER: { value: 'tank-healer', label: 'Tank/Healer' },
            TANK_DPS: { value: 'tank-dps', label: 'Tank/DPS' },
            HEALER_DPS: { value: 'healer-dps', label: 'Healer/DPS' },
            RANGED: { value: 'rdps', label: 'Ranged DPS' },
            HEALER_RDPS: { value: 'healer-rdps', label: 'Healer/Ranged DPS' },
            TANK_RDPS: { value: 'tank-rdps', label: 'Tank/Ranged DPS' },
        } as { [key: string]: { value: string, label: string } },

        guildFactions: ['ALLIANCE'],

        guildRoles: ROLES,

        roleOrder: [
            ROLES.ADMIN,
            ROLES.GUILD_MASTER,
            ROLES.RAID_LEADER,
            ROLES.MODERATOR,
            ROLES.COMRADE,
            ROLES.RAIDER,
            ROLES.MEMBER,
            ROLES.GUEST,
            ROLES.ALTER,
        ],

    });
}