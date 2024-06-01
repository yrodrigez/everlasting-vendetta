import {CURRENT_MAX_LEVEL} from "@/app/util/constants";

interface Character {
    playable_class: any;
    level: any;
    rankName: any;
    name: any;
    icon: any;
    realm: any;
    className: any;
    id: any
}


export async function fetchGuildInfo(token: string, guildId: string = '5826-2239011', locale: string = 'en_US') {
    const url = `https://eu.api.blizzard.com/data/wow/guild/${guildId}/roster`;
    const headers = new Headers();
    headers.append('Authorization', 'Bearer ' + token);


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
}

const rankComparator = (a: any, b: any) => {
    const rankComparison = a.rank - b.rank
    if (rankComparison !== 0) {
        return rankComparison
    }

    return a.character.level - b.character.level
}

export function getGuildRosterFromGuildInfo(guildInfo: any): Character[] {
    const maxLevel = CURRENT_MAX_LEVEL;
    const vipMembersNames = [
        'Alveric',
        'Kornyous',
        'Nivlor',
        'Aythan',
        'Aoriad',
        'Porco',
        'Tacy',
        'Felsargon'
    ]

    const vipMembers = guildInfo?.members.filter((member: any) => {
        return vipMembersNames.includes(member.character.name)
    }).sort(rankComparator);

    const maxLevelMembers = (guildInfo?.members || []).filter((member: any) => {
        return member.character.level >= maxLevel && !vipMembersNames.includes(member.character.name) && member.rank <= 3
    }).sort(rankComparator);

    const minLevelMembers = (guildInfo?.members || []).filter((member: any) => {
        return member.character.level >= maxLevel && !vipMembersNames.includes(member.character.name) && (member.rank > 5 || member.rank === 4)
    }).sort(rankComparator);

    return [...vipMembers, ...maxLevelMembers, ...minLevelMembers].map(rosterMapper)
}


const getPlayerClassById = (classId: number) => {
    const classes = {
        1: {name: 'Warrior', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_warrior.jpg'},
        2: {name: 'Paladin', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_paladin.jpg'},
        3: {name: 'Hunter', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_hunter.jpg'},
        4: {name: 'Rogue', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_rogue.jpg'},
        5: {name: 'Priest', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_priest.jpg'},
        7: {name: 'Shaman', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_shaman.jpg'},
        8: {name: 'Mage', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_mage.jpg'},
        9: {name: 'Warlock', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_warlock.jpg'},
        11: {name: 'Druid', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_druid.jpg'},
    } as any

    return classes[classId] || {name: 'Unknown', icon: 'unknown'}
}

function getRankName(rank: number) {
    const ranks = {
        0: 'Glorious Leader',
        1: 'Respected Comrade',
        2: 'Respected Comrade',
        3: 'Respected Raider',
        4: 'People',
        5: 'Alter'
    } as any

    return ranks[rank] || 'Member'
}

function rosterMapper(member: any) {
    const {name, realm, id, level, playable_class} = member.character
    const {name: className, icon} = getPlayerClassById(playable_class.id)
    const rankName = getRankName(member.rank)

    return {
        name,
        realm,
        id,
        level,
        playable_class,
        rankName,
        className,
        icon,
    }
}
