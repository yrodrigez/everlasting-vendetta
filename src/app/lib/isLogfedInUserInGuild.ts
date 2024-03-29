import {cookies} from "next/headers";
import {fetchBattleNetWoWAccounts} from "@/app/lib/fetchBattleNetWoWaccounts";
import {fetchGuildInfo} from "@/app/lib/fetchGuildInfo";

export default async function isLoggedUserInGuild() {
    const token = cookies().get(process.env.BNET_COOKIE_NAME!)?.value
    if (!token) {
        return false
    }

    const availableCharacters = await fetchBattleNetWoWAccounts(token)
    const guild = await fetchGuildInfo(token)
    const currentRoster = guild.members
    return availableCharacters.some((character: any) => {
        if (currentRoster.some((member: any) => member.character.id === character.id)) {
            return true
        }
    })
}
