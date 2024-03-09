import axios from "axios";
import Image from "next/image";

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
        console.error('Error fetching guild info:', response);
        return null;
    }

    return response.data;
}

function getGuildRosterFromGuildInfo(guildInfo: any) {
    return guildInfo?.members || [];
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

export default async function Home() {

    const {token} = await getBlizzardToken()
    const guildInfo = await fetchGuildInfo(token)
    const guildRoster = getGuildRosterFromGuildInfo(guildInfo)

    return (
        <main className="flex min-h-screen flex-col items-center">
            <div className="w-full h-16 flex items-center gap-3 justify-center">
                <span>Home</span>
                <span>News</span>
                <span>Apply</span>
                <span>Roster</span>
                <span>About us</span>
                <span>Raid Calendar</span>
            </div>
            <img src="/banner.png" alt="Guild banner" className="w-[70%]"/>
        </main>
    );
}
