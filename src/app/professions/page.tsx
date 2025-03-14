import createServerSession from "@utils/supabase/createServerSession";
import {cookies} from "next/headers";
import Link from "next/link";
import CharacterAvatar from "@/app/components/CharacterAvatar";
import {GUILD_REALM_SLUG} from "@utils/constants";

export const dynamic = 'force-dynamic'

export default async function ProfessionsPage() {
    const {supabase} = await createServerSession({cookies})
    const {data, error} = await supabase.rpc('get_member_profession_spell_count')
        .overrideTypes<{
            member_name: string,
            profession_name: string,
            spell_count: number
        }[],{ merge: false }>()

    if (error || !Array.isArray(data)) {
        console.error('Error fetching profession spell counts:', error)
        return <div>Error fetching professions</div>
    }

    const professions = data.reduce((acc, {member_name: memberName, profession_name: professionName, spell_count}) => {

        const member = acc.find((m) => m.memberName === memberName)
        if (!member) {
            acc.push({
                memberName,
                professions: [{
                    name: professionName,
                    icon: `/profession-icons/${professionName?.toLowerCase()}.webp`,
                    recipeCount: spell_count
                }]
            })
            return acc
        } else {
            const profession = member.professions.find(({name}) => name === professionName)
            if (!profession) {
                member.professions.push({
                    name: professionName,
                    icon: `/profession-icons/${professionName?.toLowerCase()}.webp`,
                    recipeCount: spell_count
                })
            } else {
                profession.recipeCount = spell_count
            }
            return acc
        }

    }, [] as { memberName: string, professions: { name: string, icon: string, recipeCount: number }[] }[])

    return (
        <main className="flex w-full h-full flex-col">
            <h1 className="text-4xl font-bold text-center mb-4">Professions</h1>
            {(professions).map((member) => {
                const {memberName, professions} = member
                return <Link
                    href={`/roster/${encodeURIComponent(memberName?.toLowerCase())}/professions`}
                    key={memberName}
                    className="flex flex-1 flex-col md:flex-row items-center gap-2 mb-2 p-3 hover:cursor-pointer hover:bg-white hover:bg-opacity-20 backdrop-filter backdrop-blur-md rounded border-[1px] border-gold">
                    <h1 className="md:hidden font-bold text-2xl">{memberName}</h1>
                    <div className="flex gap-3 justify-center items-center md:w-[186px]">
                        <CharacterAvatar realm={GUILD_REALM_SLUG}
                                         characterName={memberName}/>
                    </div>
                    <div className="flex flex-col gap-1 ml-6">
                        <h1 className="hidden md:block font-bold text-2xl">{memberName}</h1>
                        <div className="flex gap-2">
                            {professions.map(({name, icon, recipeCount}) => {
                                return <div key={name} className="flex flex-col items-center gap-1">
                                    <img src={icon} alt={name} width={32} height={32} className="rounded-full"/>
                                    <span>{name} ({recipeCount})</span>
                                </div>
                            })}
                        </div>
                    </div>
                </Link>
            })}
        </main>
    )
}