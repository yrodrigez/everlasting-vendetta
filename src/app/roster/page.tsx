import CharacterAvatar from "@/app/components/CharacterAvatar";
import Link from "next/link";
import {GET as getGuildRoster} from "@/app/api/v1/services/roster/route";

export default async function Page() {
    const response = await getGuildRoster()
    const guildRoster = await response.json()

    return <main className="flex w-full h-full flex-col">
        {(guildRoster).map((member: any) => {
            const {name, realm, id, level, icon, className, rankName} = member
            return <Link
                href={`/roster/${name.toLowerCase()}`}
                key={id}
                className="flex flex-1 flex-col md:flex-row items-center gap-2 mb-2 p-3 hover:cursor-pointer hover:bg-white hover:bg-opacity-20 backdrop-filter backdrop-blur-md rounded border-[1px] border-gold">
                <h1 className="md:hidden font-bold text-2xl">{name}</h1>
                <div className="flex gap-3 justify-center items-center md:w-[186px]">
                    <CharacterAvatar realm={realm.slug}
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
