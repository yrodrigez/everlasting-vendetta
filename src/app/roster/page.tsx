import axios from "axios";
import CharacterAvatar from "@/app/components/CharacterAvatar";
import Link from "next/link";

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


async function fetchGuildInfo(token: string, guildId: string = '5826-2239011', locale: string = 'en_US') {
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

function getGuildRosterFromGuildInfo(guildInfo: any) {
    const maxLevel = 40;
    const maxLevelMembers = (guildInfo?.members || []).filter((member: any) => {
        return member.character.level >= maxLevel
    }).sort((a: any, b: any) => {
        return a.rank - b.rank

    });
    const minLevelMembers = (guildInfo?.members || []).filter((member: any) => {
        return member.character.level < maxLevel && member.character.level > 15
    }).sort((a: any, b: any) => {
        return a.rank - b.rank
    });

    return [...maxLevelMembers, ...minLevelMembers]
}

function fetchMemberInfo(token: string, realm: string, characterName: string, locale: string = 'en_US') {
    const url = `https://eu.api.blizzard.com/profile/wow/character/${realm}/${characterName}`;
    const headers = new Headers();
    headers.append('Authorization', 'Bearer ' + token);

    return axios.get(`${url}?locale=${locale}&namespace=profile-classic1x-eu`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
}

const getBlizzardToken = async () => {
    const url: string = `https://ijzwizzfjawlixolcuia.supabase.co/functions/v1/everlasting-vendetta`
    const jwt: string = `Bearer ` + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const response = await axios.get(url, {
        headers: {
            'Authorization': jwt
        }
    })

    return response.data
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
        2: 'People',
        3: 'People',
        4: 'People',
        5: 'People',
        6: 'People',
        7: 'People',
        8: 'People',
    } as any

    return ranks[rank] || 'Unknown'
}


export default async function Page() {
    const {token} = await getBlizzardToken()
    const guildInfo = await fetchGuildInfo(token)
    const guildRoster = getGuildRosterFromGuildInfo(guildInfo)
    return <main className="flex w-full h-full flex-col">
        {guildRoster.map((member: any) => {
            const {name, realm, id, level, playable_class} = member.character
            const {name: className, icon} = getPlayerClassById(playable_class.id)
            const rank = member.rank
            const rankName = getRankName(rank)
            return <Link
                href={`/roster/${name.toLowerCase()}`}
                key={id}
                className="flex flex-1 flex-col md:flex-row items-center gap-2 mb-2 p-3 hover:cursor-pointer hover:bg-white hover:bg-opacity-20 backdrop-filter backdrop-blur-md rounded border-[1px] border-gold">
                <h1 className="md:hidden font-bold text-2xl">{name}</h1>
                <div className="flex gap-3 justify-center items-center md:w-[186px]">
                    <CharacterAvatar token={token} realm={realm.slug}
                                     characterName={name}/>
                    <div
                        className={`w-[2px] h-20 bg-gold rounded-full backdrop-filter backdrop-blur-md`}>{/*separator*/}</div>
                    <div className="flex justify-center flex-col items-center">
                        <img src={icon}
                             alt={className}
                             className="rounded-full h-8"/>
                        <p>{className}</p>
                        <p>{level}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-1 ml-6">
                    <p className="hidden md:block font-bold text-2xl">{name}</p>
                    <p>{`${rankName} of Everlasting Vendetta`}</p>
                </div>
            </Link>
        })}
    </main>

}
