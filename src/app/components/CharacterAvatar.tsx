'use client'
import {useEffect, useState} from "react";
import Image from "next/image";
import {getRoleIcon} from "@/app/apply/components/utils";


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

const CharacterAvatar = ({
                             token,
                             realm,
                             characterName,
                             className = `rounded-full md:w-24 w-16 border-2 border-gold`,
                             width = 80,
                             height = 80,
                             role
                         }: {
    token?: { name: string, value: string } | string,
    realm: string,
    characterName: string,
    width?: number,
    height?: number,
    className?: string,
    role?: 'tank' | 'dps' | 'healer' | null
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
        const response = fetch(`/api/v1/services/member/avatar/get?realm=${realm}&characterName=${characterName}&token=${currentToken?.value}`)
        response.then((res) => res.json()).then((data) => {
            setAvatar(data.avatar === 'unknown' ? '/avatar-anon.png' : data.avatar)
            characterImageUrlLocalStorageCache(realm, characterName).set(data.avatar)
        }).catch(() => {
            setAvatar('/avatar-anon.png')
        })
    }, [token, realm, characterName, currentToken?.value])

    return <div className="relative">
        {avatar && <Image
          width={width}
          height={height}
          src={avatar === 'unknown' ? '/avatar-anon.png' : avatar}
          alt={characterName}
          className={className}
        />}
        {role && <Image src={getRoleIcon(role)} alt={role} width={16} height={16}
                        className="absolute top-0 -right-3 rounded-full border border-gold"/>}
    </div>

}

export default CharacterAvatar
