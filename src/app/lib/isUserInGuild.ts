import {fetchGuildInfo} from "@/app/lib/fetchGuildInfo";
import {fetchBattleNetWoWAccounts} from "@/app/lib/fetchBattleNetWoWaccounts";

export const isUserInGuild = async (token: {
    name: string,
    value: string
}): Promise<boolean> => {
    const currentUserCharacters = await fetchBattleNetWoWAccounts(token.value)
    if (!currentUserCharacters) {
        return false
    }

    const guild = await fetchGuildInfo(token.value)
    if (!guild) {
        return false
    }
    const currentRoster = guild.members
    return currentRoster.some((character: any) => {
        return currentUserCharacters.some((ownedCharacter: any) => {
            return character.character.id === ownedCharacter.id
        })
    })
}
