'use client'
import axios from "axios";
import {useEffect, useState} from "react";

const fetchCharacterAvatar = async (token: string, realm: string, characterName: string, locale: string = 'en_US', namespace: string = 'profile-classic1x-eu') => {
    const url = `https://eu.api.blizzard.com/profile/wow/character/${realm}/${characterName.toLowerCase()}/character-media`
    const headers = new Headers()
    headers.append('Authorization', 'Bearer ' + token)
    const queryParams = new URLSearchParams({
        locale,
        namespace
    })

    const {data} = await axios.get(`${url}?${queryParams.toString()}`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })

    return data?.assets?.find((asset: any) => {
        return asset.key === 'avatar'
    })?.value || 'unknown'
}

const CharacterAvatar = ({token, realm, characterName, className = `rounded-full md:w-24 w-16 border-2 border-[rgb(219,210,195)]`}: { token: string, realm: string, characterName: string, className?: string }) => {
    const [avatar, setAvatar] = useState('/avatar-anon.png')

    useEffect(() => {
        try {
            fetchCharacterAvatar(token, realm, characterName)
                .then(setAvatar)
                .catch(() => {
                setAvatar('/avatar-anon.png')
            })
        } catch (e) {
            //console.error('Error fetching character avatar:', e)
        }
    }, [token, realm, characterName])

    return <img src={avatar} alt={characterName} className={className}/>

}

export default CharacterAvatar
