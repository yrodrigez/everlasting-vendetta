import axios from "axios";


interface APIReference {
    href: string;
}

interface Character {
    key: APIReference;
    name: string;
    id: number;
    realm: Realm;
    level: number;
    playable_class: PlayableClass;
    playable_race: PlayableRace;
}

interface Realm {
    key: APIReference;
    name: string;
    id: number;
    slug: string;
}

interface PlayableClass {
    key: APIReference;
    id: number;
}

interface PlayableRace {
    key: APIReference;
    id: number;
}

interface GuildMember {
    character: Character;
    rank: number;
}

interface GuildRoster {
    guildRoster: GuildMember[];
}


export async function fetchGuildInfo(token: string, guildId: string = '5826-2239011', locale: string = 'en_US') {
    const url = `https://eu.api.blizzard.com/data/wow/guild/${guildId}/roster`;
    const headers = new Headers();
    headers.append('Authorization', 'Bearer ' + token);

    const response = await axios.get(`${url}?locale=${locale}&namespace=profile-classic1x-eu`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })

    if (!response || response.status !== 200) {
        //console.error('Error fetching guild info:', response);
        return null;
    }

    return response.data;
}

export function getGuildRosterFromGuildInfo(guildInfo: any) {
    const maxLevel = 40;
    const vipMembersNames = [
        'Alveric',
        'Kornyous',
        'Nivlor',
        'Aythan',
        'Aoriad',
        'Porco',
        'Tacy',
        'Muddalun'
    ]
    const vipMembers = guildInfo?.members.filter((member: any) => {
        return member.rank === 0 || member.rank === 1 || vipMembersNames.includes(member.character.name)
    }).sort((a: any, b: any) => {
        return a.rank - b.rank
    });

    const maxLevelMembers = (guildInfo?.members || []).filter((member: any) => {
        return member.character.level >= maxLevel && !vipMembersNames.includes(member.character.name)
    }).sort((a: any, b: any) => {
        return a.rank - b.rank

    });

    const minLevelMembers = (guildInfo?.members || []).filter((member: any) => {
        return member.character.level < maxLevel && member.character.level > 15 && !vipMembersNames.includes(member.character.name)
    }).sort((a: any, b: any) => {
        return a.rank - b.rank
    });

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

    return ranks[rank] || 'Unknown'
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
