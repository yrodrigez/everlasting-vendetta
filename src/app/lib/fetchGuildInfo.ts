import { GUILD_ID, REALM_ID, ROLE } from "@/app/util/constants";

type Guild = {
    id: number;
    name: string;
    rank: number;
};

type Realm = {
    id: number;
    name: string;
    slug: string;
};

type PlayableClass = {
    name: string;
};

type CharacterClass = {
    name: string;
};

export type Character = {
    id: number;
    name: string;
    guild: Guild;
    level: number;
    realm: Realm;
    avatar: string;
    playable_class: PlayableClass;
    character_class: CharacterClass;
    last_login_timestamp: number;
};


export async function fetchGuildInfo(token: string, guildId: string = `${REALM_ID}-${GUILD_ID}`, locale: string = 'en_US') {
    const url = `https://eu.api.blizzard.com/data/wow/guild/${guildId}/roster`;
    const headers = new Headers();
    headers.append('Authorization', 'Bearer ' + token);

    try {
        const response = await fetch(`${url}?locale=${locale}&namespace=profile-classic1x-eu`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })

        if (!response.ok) {
            console.error('Error fetching guild info:', response.status, response.statusText, await response.text());
            return null;
        }

        return await response.json();
    } catch (e) {
        console.error('Error fetching guild info:', e);
        return null;
    }
}

const rankComparator = (a: any, b: any) => {
    const rankComparison = a.rank - b.rank
    if (rankComparison !== 0) {
        return rankComparison
    }

    return a.character.level - b.character.level
}

export function getGuildRosterFromGuildInfo(guildInfo: (Character & { updated_at: string; })[], roles: {
    member_id: number;
    role: string;
}[] | null): (Character & {
    rankName: string;
    className: string;
    icon: string;
    rank: number;
})[] {


    const guildMasterIds = roles?.filter((role) => role.role === ROLE.GUILD_MASTER).map((role) => role.member_id) ?? []
    const raidLeaderIds = roles?.filter((role) => role.role === ROLE.RAID_LEADER).map((role) => role.member_id) ?? []
    const vipMembersIds = roles?.filter((role) => role.role === ROLE.COMRADE).map((role) => role.member_id) ?? []
    const raidersIds = roles?.filter((role) => role.role === ROLE.RAIDER).map((role) => role.member_id) ?? []
    const altersIds = roles?.filter((role) => role.role === ROLE.ALTER).map((role) => role.member_id) ?? []

    const guildMasterMember = guildInfo?.filter((member: any) => {
        return guildMasterIds.includes(member.id)
    }).map(function (member: Character) {
        return {
            ...member,
            guild: {
                ...member.guild,
                rank: 0
            }
        }
    });

    const raidLeaderMembers = guildInfo?.filter((member: any) => {
        return raidLeaderIds.includes(member.id) && !guildMasterIds.includes(member.id)
    }).map(function (member: Character) {
        return {
            ...member,
            guild: {
                ...member.guild,
                rank: 1
            }
        }
    });

    const vipMembers = guildInfo?.filter((member: any) => {
        return vipMembersIds.includes(member.id) && !guildMasterIds.includes(member.id) && !raidLeaderIds.includes(member.id) && !altersIds.includes(member.id)
    }).sort(rankComparator).sort((a: any, b: any) => {
        // sort by last updated
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    }).map(function (member: Character) {
        return {
            ...member,
            guild: {
                ...member.guild,
                rank: member.name === 'Alveric' ? 0 : 2
            }
        }
    });

    const raidersMembers = guildInfo?.filter((member: any) => {
        return raidersIds.includes(member.id) && !vipMembersIds.includes(member.id) && !guildMasterIds.includes(member.id) && !altersIds.includes(member.id) && !raidLeaderIds.includes(member.id)
    }).map(function (member: Character) {
        return {
            ...member,
            guild: {
                ...member.guild,
                rank: 3
            }
        }
    }).sort((a: any, b: any) => {
        // sort by last updated
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    });

    const maxLevelMembers = (guildInfo || []).filter((member: any) => {
        return !guildMasterIds.includes(member.id) && !vipMembersIds.includes(member.id) && !raidersIds.includes(member.id) && member.level >= 58 && !altersIds.includes(member.id) && !raidLeaderIds.includes(member.id)
    }).map(function (member: Character) {
        return {
            ...member,
            guild: {
                ...member.guild,
                rank: member?.guild?.rank ?? 6
            }
        }
    }).sort((a: any, b: any) => {
        // sort by last updated
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })


    return [...guildMasterMember, ...raidLeaderMembers, ...vipMembers, ...raidersMembers, ...maxLevelMembers].map(rosterMapper)
}


const getPlayerClassById = (className: string) => {
    const classes = [
        { name: 'Warrior', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_warrior.jpg' },
        { name: 'Paladin', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_paladin.jpg' },
        { name: 'Hunter', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_hunter.jpg' },
        { name: 'Rogue', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_rogue.jpg' },
        { name: 'Priest', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_priest.jpg' },
        { name: 'Shaman', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_shaman.jpg' },
        { name: 'Mage', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_mage.jpg' },
        { name: 'Warlock', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_warlock.jpg' },
        { name: 'Druid', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_druid.jpg' },
    ]

    return classes.find((c) => c.name === className) || { name: 'Unknown', icon: 'unknown' }
}

function getRankName(rank: number) {
    const ranks = {
        0: 'Glorious Leader',
        1: 'Raid Leader',
        2: 'Respected Comrade',
        3: 'Respected Raider',
        4: 'People',
        5: 'Alter',
        6: 'Member',
    } as any

    return ranks[rank] || 'Member'
}

function rosterMapper(member: Character) {
    const { name, realm, id, level, playable_class } = member
    const { name: className, icon } = getPlayerClassById(playable_class.name)
    const rankName = getRankName(member.guild.rank)

    return {
        ...member,
        name,
        realm,
        id,
        level,
        playable_class,
        rankName,
        className,
        icon,
        rank: member.guild.rank ?? 6
    }
}
