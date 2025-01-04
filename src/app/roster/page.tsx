import Link from "next/link";
import {cookies} from "next/headers";
import {type Character, getGuildRosterFromGuildInfo} from "@/app/lib/fetchGuildInfo";
import {CURRENT_MAX_LEVEL, GUILD_NAME, GUILD_REALM_NAME} from "@/app/util/constants";
import moment from "moment";
import createServerSession from "@utils/supabase/createServerSession";

export const dynamic = 'force-dynamic'

const MemberView = ({member}: { member: Character & { icon: string, className: string } }) => {
    const {name, level, icon, className,} = member


    return <Link
        href={`/roster/${name.toLowerCase()}`}
        className={`flex flex-1 w-64 min-w-64 max-w-64 flex-col mb-4 items-center gap-2 p-4 hover:cursor-pointer hover:bg-${className.toLowerCase()} hover:bg-opacity-30 hover:shadow-2xl hover:shadow-${className.toLowerCase()} transition-all  bg-dark backdrop-filter backdrop-blur-md rounded-lg border-[1px] border-gold`}>
        <h1 className="font-bold text-xl text-gold">{name}</h1>
        <div className="flex flex-col gap-3 justify-center items-center md:w-[186px]">
            <div
                className="relative w-16 h-16 rounded-full">
                <img src={icon}
                     alt={className}
                     className="rounded-full h-5 absolute -top-1 -right-1 z-50 border border-gold"/>
                <img
                    src={member.avatar}
                    alt={`${member.name}'s portrait`}
                    className="object-cover rounded-full w-16 h-16 border-2 border-gold mb-2"
                />

            </div>

            <div className="flex justify-center flex-col items-center">
                <p className={`text-${className.toLowerCase()}`}>{className}</p>
                <p>Level: {level}</p>
            </div>
        </div>
    </Link>
}

export async function generateMetadata() {

    return {
        title: `${GUILD_NAME} Roster - ${GUILD_REALM_NAME} Server | Everlasting Vendetta`,
        description: `Explore the roster of ${GUILD_NAME}, one of the most active guilds on the ${GUILD_REALM_NAME} server.`,
        keywords: 'wow, world of warcraft, guild roster, raiding, pve, pvp, classic, tbc, burning crusade, shadowlands, lone wolf, everlasting vendetta, guild events, guild members, guild forum, season of discovery, sod',
    };
}

const RANKS = {
    'Glorious Leader': 1,
    'Respected Comrade': 2,
    'Respected Raider': 3,
    'Member': 4,
}

export default async function Page() {

    const {supabase} = await createServerSession({cookies})
    const {data, error} = await supabase.from('ev_member')
        .select('updated_at, character')
        .filter('character->>level', 'gte', CURRENT_MAX_LEVEL - 10)
        .filter('character->guild->>name', 'eq', GUILD_NAME)
        .filter('updated_at', 'gte', moment('2024-09-19').format('YYYY-MM-DD')) // 30 days
        .order('updated_at', {ascending: false})
        .returns<{ updated_at: string, character: Character }[]>()

    if (error) {
        console.error(error)
        return <div>Error {error.message}</div>
    }

    const guildRoster = getGuildRosterFromGuildInfo(data.map(({character, updated_at}) => ({
        ...character,
        updated_at
    })).reduce((acc, character) => {
        // should add the character if it doesn't exist or if the character is more recent
        const existingCharacter = acc.find((c) => c.name === character.name)
        if (!existingCharacter) {
            return [...acc, character]
        }
        if (new Date(existingCharacter.updated_at) < new Date(character.updated_at)) {
            return acc.map((c) => c.id === character.id ? character : c)
        }
        return acc
    }, [] as (Character & { updated_at: string })[]))

    const groupByRank = guildRoster.reduce((acc, member) => {
        if (!acc[member.rankName]) {
            acc[member.rankName] = []
        }
        acc[member.rankName].push(member)
        return acc
    }, {} as Record<string, (Character & { icon: string, className: string, rankName: string })[]>)


    return <main className="flex w-full h-full flex-col items-center">
        {Object.entries(groupByRank).sort(([rankA], [rankB]) => RANKS[rankA as keyof typeof RANKS] - RANKS[rankB as keyof typeof RANKS]).map(([rankName, members]) => {
            return <div key={rankName} className="flex flex-col w-full items-center">
                <h1 className="text-gold text-2xl font-bold">{rankName}</h1>
                <div className="flex flex-wrap gap-4 w-full justify-center items-center">
                    {members.sort((a, b) => {
                        // @ts-ignore
                        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                    }).map((member) => {
                        return <MemberView key={member.id} member={member}/>
                    })}
                </div>
            </div>
        })}
    </main>
}
