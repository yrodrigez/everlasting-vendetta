import {getBlizzardToken} from "@/app/lib/getBlizzardToken";

export const fetchCharacterAvatar = async (token: string, realm: string, characterName: string, locale: string = 'en_US', namespace: string = 'profile-classic1x-eu') => {
    const url = `https://eu.api.blizzard.com/profile/wow/character/${realm}/${characterName.toLowerCase()}/character-media`
    if (!token) {
        token = await getBlizzardToken()
    }

    const response = await fetch(`${url}?locale=${locale}&namespace=${namespace}`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })

    if (!response.ok) {
        console.error('Error fetching character avatar', characterName, response.status, response.statusText)
        return '/avatar-anon.png'
    }
    const data = await response.json()

    return data?.assets?.find((asset: any) => {
        return asset.key === 'avatar'
    })?.value || '/avatar-anon.png'
}
