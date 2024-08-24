import Link from "next/link";
import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {type Character, getGuildRosterFromGuildInfo} from "@/app/lib/fetchGuildInfo";
import {CURRENT_MAX_LEVEL, GUILD_NAME} from "@/app/util/constants";

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

export default async function Page() {

    const supabase = createServerComponentClient({cookies})
    const {data, error} = await supabase.from('ev_member')
        .select('character')
        .filter('character->>level', 'gte', CURRENT_MAX_LEVEL)
        .filter('character->guild->>name', 'eq', GUILD_NAME)
        .filter('updated_at', 'gte', new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()) // 30 days
        .order('updated_at', {ascending: false})
        .returns<{ character: Character }[]>()
    if (error) {
        console.error(error)
        return <div>Error {error.message}</div>
    }

    const guildRoster = getGuildRosterFromGuildInfo(data.map(({character}) => character))
    const groupByRank = guildRoster.reduce((acc, member) => {
        if (!acc[member.rankName]) {
            acc[member.rankName] = []
        }
        acc[member.rankName].push(member)
        return acc
    }, {} as Record<string, (Character & { icon: string, className: string, rankName: string })[]>)

    return <main className="flex w-full h-full flex-col items-center">
        {Object.entries(groupByRank).map(([rankName, members]) => {
            return <div key={rankName} className="flex flex-col w-full items-center">
                <h1 className="text-gold text-2xl font-bold">{rankName}</h1>
                <div className="flex flex-wrap gap-4 w-full justify-center items-center">
                    {members.map((member) => {
                        return <MemberView key={member.id} member={member}/>
                    })}
                </div>
            </div>
        })}
    </main>
}
