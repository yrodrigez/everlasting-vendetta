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

    try {
        const {data} = await axios.get(`${url}?${queryParams.toString()}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })

        return data?.assets?.find((asset: any) => {
            return asset.key === 'avatar'
        })?.value || 'unknown'
    } catch (e) {
        //console.error('Error fetching character avatar:', e)
        return '/avatar-anon.png'
    }
}

function characterImageUrlLocalStorageCache(realm: string, characterName: string) {
    return {
        get: () => {
            const cached = localStorage.getItem(`characterImageUrl:${realm}:${characterName}`)
            if (!cached) return null
            const {url, timestamp} = JSON.parse(cached)
            const now = new Date()
            const then = new Date(timestamp)
            const diff = now.getTime() - then.getTime()
            const diffInHours = diff / 1000 / 60 / 60
            if (diffInHours > 24) return null
            return url
        },
        set: (url: string) => {
            localStorage.setItem(`characterImageUrl:${realm}:${characterName}`, JSON.stringify({
                url,
                timestamp: new Date().toISOString()
            }))
        }
    }
}

const CharacterAvatar = ({token, realm, characterName, className = `rounded-full md:w-24 w-16 border-2 border-gold`}: {
    token?: { name: string, value: string } | string,
    realm: string,
    characterName: string,
    className?: string
}) => {
    const [currentToken, setCurrentToken] = useState(typeof token === 'string' ? {
        name: 'bnetToken',
        value: token
    } : token)

    const [avatar, setAvatar] = useState('/avatar-anon.png')
    useEffect(() => {
        if (!currentToken?.value) setCurrentToken({name: 'bnetToken', value: sessionStorage.getItem('bnetToken') || ''})
        if (!currentToken) return setAvatar('/avatar-anon.png')
        const cachedUrl = characterImageUrlLocalStorageCache(realm, characterName).get()
        if (cachedUrl) return setAvatar(cachedUrl)
        try {
            fetchCharacterAvatar(currentToken?.value, realm, characterName)
                .then((url) => {
                    setAvatar(url)
                    characterImageUrlLocalStorageCache(realm, characterName).set(url)
                })
                .catch(() => {
                    setAvatar('/avatar-anon.png')
                })
        } catch (e) {
            //console.error('Error fetching character avatar:', e)
        }
    }, [token, realm, characterName, currentToken?.value])

    return <img src={avatar} alt={characterName} className={className}/>

}

export default CharacterAvatar
