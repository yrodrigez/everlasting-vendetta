import {fetchCharacterProfessionsSpells} from "@/app/roster/[name]/components/professions-api";
import {cookies} from "next/headers";
import createServerSession from "@utils/supabase/createServerSession";
import WoWService from "@services/wow-service";
import CharacterProfessions from "@/app/roster/[name]/components/CharacterProfessions";
import {GUILD_REALM_SLUG} from "@utils/constants";
import CharacterAvatar from "@/app/components/CharacterAvatar";
import {getBlizzardToken} from "@/app/lib/getBlizzardToken";

export const dynamic = 'force-dynamic'

export default async function Page({params}: { params: Promise<{ name: string }> }) {
    const {name} = await params
    const characterName = decodeURIComponent(name.toLowerCase())
    const {fetchMemberInfo} = new WoWService()
    const characterInfo = await fetchMemberInfo(characterName)
    const {supabase} = await createServerSession({cookies})
    const professions = await fetchCharacterProfessionsSpells(supabase, characterInfo.id)
    const cookieToken = (await cookies()).get(process.env.BNET_COOKIE_NAME!)?.value
    const {token} = (cookieToken ? {token: cookieToken} : (await getBlizzardToken()))


    return (
        <div className="flex w-full h-full flex-col gap-2 overflow-auto scrollbar-pill p-2">
            <div className="w-full h-28 block">
                <div className="flex items-center gap-4 mb-4 justify-center w-full">
                    <div className="w-20 h-20 rounded-full overflow-hidden min-w-20">
                        <CharacterAvatar token={token} realm={GUILD_REALM_SLUG} characterName={characterInfo.name}
                                         className={`rounded-full border-3  border-${characterInfo?.character_class?.name?.toLowerCase()}`}/>
                    </div>
                    <div className="grid gap-1.5 w-full">
                        <h1 className="font-semibold text-lg w-full flex items-center justify-between">{characterInfo?.name}'s professions</h1>
                        <p className="text-sm text-muted">
                            Level {characterInfo?.level} {characterInfo?.race?.name} <span
                            className={`text-${characterInfo?.character_class?.name?.toLowerCase()} font-bold`}>{characterInfo?.character_class?.name}</span>
                        </p>

                    </div>
                </div>
            </div>
            <CharacterProfessions
                characterId={characterInfo.id}
                professions={professions}
                className="w-full h-full bg-wood border border-wood-100 flex gap-2 p-1 rounded-md grow min-h-0"
            />
        </div>
    )

}