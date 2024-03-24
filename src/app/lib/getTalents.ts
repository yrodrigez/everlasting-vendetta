import {getBlizzardToken} from "@/app/lib/getBlizzardToken";

export type GetTalentsParams = {
    token?: string
    realm: string
    characterName: string
    locale?: string
    namespace?: string
}

export default async function getCharacterTalents({
                                             token,
                                             realm = 'lone-wolf',
                                             characterName,
                                             locale = 'en_US',
                                             namespace = 'profile-classic1x-eu'
                                         }: GetTalentsParams) {
    const url = `https://eu.api.blizzard.com/profile/wow/character/${realm}/${characterName.toLowerCase()}/specializations`
    const queryParameters = new URLSearchParams({
        locale,
        namespace
    })

    if (!token) {
        token = await getBlizzardToken()
    }

    const response = await fetch(`${url}?${queryParameters.toString()}`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })

    return await response.json()
}
