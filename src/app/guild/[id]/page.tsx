import {fetchGuildInfo} from "@/app/lib/fetchGuildInfo";
import {getBlizzardToken} from "@/app/lib/getBlizzardToken";
import {cookies} from "next/headers";
import Link from "next/link";
import CharacterAvatar from "@/app/components/CharacterAvatar";
import {CURRENT_MAX_LEVEL, GUILD_NAME} from "@/app/util/constants";
import {getClassIcon} from "@/app/apply/components/utils";
import {redirect} from "next/navigation";
import WoWService from "@services/wow-service";
import {BnetLoginButton} from "@/app/components/BnetLoginButton";
import {Button} from "@/app/components/Button";
import createServerSession from "@/app/util/supabase/createServerSession";

function getClassName(classId: number) {
    const classes = {
        1: 'Warrior',
        2: 'Paladin',
        3: 'Hunter',
        4: 'Rogue',
        5: 'Priest',
        6: 'Death Knight',
        7: 'Shaman',
        8: 'Mage',
        9: 'Warlock',
        10: 'Monk',
        11: 'Druid',
        12: 'Demon Hunter',
    }
    // @ts-ignore
    return classes[classId] || 'Unknown'
}

export default async function Page({params}: { params: Promise<{ id: string }> }) {

    const { auth } = await createServerSession();
    const session = await auth.getSession();
    
    if (!session?.isGuildMember) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-4xl font-bold text-center mb-4">You should be a member of <span className="text-gold font-bold">{GUILD_NAME}</span> to see others guild's rosters</h1>
                <div className="flex items-center gap-2 text-default">Please <BnetLoginButton/> or <Button size="lg" className="rounded-lg" as="a" href="/apply">Apply</Button> to
                    view this page.
                </div>
                <p className="text-sm text-gray-500 mt-2">If you are a member of the guild and still see this message, make sure you are using battle.net login.</p>

            </div>
        )
    }



    const token = (await cookies()).get('bnetToken')?.value || (await getBlizzardToken()).token
    const {id: guildId} = await params
    const roster = await fetchGuildInfo(token, guildId)
    const guildRoster = (roster?.members ?? []).map((member: any) => {
        const {character, rank} = member
        const {name, realm, level, playable_class: className, id} = character
        return {
            id,
            name,
            realm,
            level,
            className: getClassName(className.id),
            icon: getClassIcon(getClassName(className.id)),
            rankName: `Rank ${rank}`,
            rank
        }
    }).filter((member: any) => member.level >= CURRENT_MAX_LEVEL && member.rank <= 3).sort((a: any, b: any) => a.rank - b.rank)

    if (!roster?.guild?.name) return <h1>There is no guild roster</h1>
    if (roster?.guild?.name === GUILD_NAME) redirect(`/roster`)

    return <main className="flex w-full h-full flex-col">
        <h1 className="text-4xl font-bold text-center mb-4">This is the shitty guild: <span
            className="text-gold">{`<${roster?.guild?.name}>`}</span></h1>
        <h2>Total members: {roster.members.length}. Showing: {guildRoster.length} with higher ranks</h2>
        <h2>LVL {CURRENT_MAX_LEVEL} characters: {roster?.members?.filter((x: any) => x.character.level === CURRENT_MAX_LEVEL)?.length}</h2>
        {(guildRoster).map((member: any) => {
            const {name, realm, id, level, icon, className, rankName, rank} = member
            return <Link
                href={`/roster/${name.toLowerCase()}`}
                key={id}
                className="flex flex-1 flex-col md:flex-row items-center gap-2 mb-2 p-3 hover:cursor-pointer hover:bg-white hover:bg-opacity-20 backdrop-filter backdrop-blur-md rounded border-[1px] border-gold">
                <h1 className="md:hidden font-bold text-2xl">{name}</h1>
                <div className="flex gap-3 justify-center items-center md:w-[186px]">
                    <CharacterAvatar realm={realm.slug}
                                     characterName={name}/>
                    <div
                        className={`w-[2px] h-20 bg-gold rounded-full backdrop-filter backdrop-blur - md`}>{/*separator*/}</div>
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
                    <p>{`${rank === 0 ? 'Guild master' : rankName}`}</p>
                </div>
            </Link>
        })}
    </main>
}
