import { type Character, getGuildRosterFromGuildInfo } from "@/app/lib/fetchGuildInfo";
import { CURRENT_MAX_LEVEL, GUILD_NAME, GUILD_REALM_NAME } from "@/app/util/constants";
import { type SupabaseClient } from "@supabase/supabase-js";
import createServerSession from "@utils/supabase/createServerSession";
import Link from "next/link";
import { createAPIService } from "../lib/api";
import { CharacterViewOptions } from "./[name]/components/CharacterViewOptions";

export const dynamic = 'force-dynamic'

const MemberView = ({ member }: { member: Character & { icon: string, className: string } }) => {
    const { name, level, icon, className, } = member

    const classColors = {
        warrior: "#C79C6E",
        paladin: "#F58CBA",
        hunter: "#ABD473",
        rogue: "#FFF569",
        priest: "#FFFFFF",
        deathknight: "#C41F3B",
        shaman: "#0070DE",
        mage: "#40C7EB",
        warlock: "#8787ED",
        monk: "#00FF96",
        druid: "#FF7D0A",
    }

    return <Link
        href={`/roster/${name.toLowerCase()}-${member.realm?.slug}`}
        className={`flex relative overflow-hidden flex-1 w-64 min-w-64 max-w-64 flex-col mb-4 items-center gap-2 p-4 hover:cursor-pointer  hover:bg-opacity-30 hover:shadow-2xl hover:shadow-${className.toLowerCase()} transition-all  bg-dark backdrop-filter backdrop-blur-md rounded-lg border-[1px] border-gold`}>
        <div className="w-full h-full absolute top-0">
            {/* @ts-ignore*/}
            <pixel-canvas
                data-gap="8"
                /* @ts-ignore*/
                data-colors={`${classColors[className.toLowerCase()]}`}
            />
        </div>
        <div className="z-10 flex flex-col justify-center items-center text-center">
            <h1 className="font-bold text-xl text-gold">{name}</h1>
            <h2 className="text-xs text-white/70">({member.realm?.name})</h2>
        </div>
        <div className="flex flex-col gap-3 justify-center items-center md:w-[186px]">
            <div
                className="relative w-16 h-16 rounded-full">
                <img src={icon}
                    alt={className}
                    className="rounded-full h-5 absolute -top-1 -right-1 z-50 border border-gold" />
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
    </Link >
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
    'Raid Leader': 2,
    'Respected Comrade': 3,
    'Respected Raider': 4,
    'Member': 5,
}

async function getInitialData(supabase: SupabaseClient, realm: string) {
    const apiService = createAPIService();
    const [{ data, error }, roster, realms] = await Promise.all([
        supabase.from('ev_member')
            .select('updated_at, character')
            .filter('character->>level', 'gte', CURRENT_MAX_LEVEL - 10)
            .filter('character->guild->>name', 'eq', GUILD_NAME)
            //.filter('updated_at', 'gte', moment().subtract(60, 'days').format('YYYY-MM-DD')) // Uncomment this line to filter characters updated in the last 60 days
            .order('updated_at', { ascending: false })
            .overrideTypes<{ updated_at: string, character: Character }[]>(),
        apiService.anon.getGuildRoster(),
        apiService.realms.getAllowed()
    ])

    if (error) {
        console.error(error)
        return {
            roster: [],
            realms: []
        }
    }

    const toAdd = roster.filter(r => !data.find(d => d.character.id === r.id)).map(r => ({
        character: r,
        updated_at: new Date(0).toISOString()
    }))

    return {
        roster: ([...data, ...toAdd] as { updated_at: string, character: Character }[]).filter(({ character }) =>
            realms.some(realm => realm.slug === character.realm?.slug)
        ).filter(({ character }) => character.realm?.slug === realm),
        realms
    }
}

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

    const { getSupabase } = await createServerSession();
    const supabase = await getSupabase();
    const query = await searchParams
    const { roster, realms } = await getInitialData(supabase, query.realm as string);

    const { data: roles, error: errorRoles } = await supabase.from('ev_member_role').select('member_id, role')
        .overrideTypes<{ member_id: number, role: string }[]>()

    if (errorRoles) {
        console.error(errorRoles)
        return <div className="flex w-full h-full justify-center items-center">
            <h1 className="text-2xl text-gold font-bold">Error loading roster</h1>
        </div>
    }


    const guildRoster = getGuildRosterFromGuildInfo(roster.map(({ character, updated_at }) => ({
        ...character,
        updated_at
    })).reduce((acc, character) => {
        // should add the character if it doesn't exist or if the character is more recent
        const existingCharacter = acc.find((c) => c.name === character.name && c.realm.slug === character.realm.slug)
        if (!existingCharacter) {
            return [...acc, character]
        }
        if (new Date(existingCharacter.updated_at) < new Date(character.updated_at)) {
            return acc.map((c) => c.name === character.name && c.realm.slug === character.realm.slug ? character : c)
        }
        return acc
    }, [] as (Character & { updated_at: string })[]), roles)

    const groupByRank = guildRoster.reduce((acc, member) => {
        if (!acc[member.rankName]) {
            acc[member.rankName] = []
        }
        acc[member.rankName].push(member)
        return acc
    }, {} as Record<string, (Character & { icon: string, className: string, rankName: string })[]>)

    const rosterView = Object.entries(groupByRank).sort(([rankA], [rankB]) => RANKS[rankA as keyof typeof RANKS] - RANKS[rankB as keyof typeof RANKS]).map(([rankName, members]) => {
        return <div key={rankName} className="flex flex-col w-full items-center">
            <h1 className="text-gold text-2xl font-bold">{rankName}</h1>
            <div className="flex flex-wrap gap-4 w-full justify-center items-center">
                {members.sort((a, b) => {
                    // @ts-ignore
                    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                }).map((member) => {
                    return <MemberView key={member.id} member={member} />
                })}
            </div>
        </div>
    })

    return <main className="flex w-full h-full flex-col items-center">
        <CharacterViewOptions
            queryKey='realm'
            items={realms.map(realm => ({
                label: realm.name,
                name: realm.slug,
                children: rosterView
            }))}
        />
    </main>
}
