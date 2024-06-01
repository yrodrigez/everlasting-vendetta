'use client'
import {useEffect, useState} from "react";
import Image from "next/image";
import {getRoleIcon} from "@/app/apply/components/utils";
import {BNET_COOKIE_NAME} from "@/app/util/constants";
import {getCookie} from "@/app/util";
import {useQuery} from "@tanstack/react-query";

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
    const tokenFromCookie = getCookie(BNET_COOKIE_NAME)
    const currentToken = !token && tokenFromCookie ? {
        name: BNET_COOKIE_NAME,
        value: tokenFromCookie
    } : typeof token === 'string' ? {
        name: BNET_COOKIE_NAME,
        value: token
    } : token

    const [avatar, setAvatar] = useState('/avatar-anon.png')

    const {data, error, isLoading} = useQuery({
        queryKey: ['characterImageUrl', realm, characterName],
        queryFn: async () => {
            const response = await fetch(`/api/v1/services/member/avatar/get?realm=${realm}&characterName=${characterName}&tokenString=${currentToken?.value}`)
            if (!response.ok) {
                throw new Error('Failed to fetch character avatar')
            }
            const {avatar} = await response.json()

            return avatar
        },
        enabled: true
    })


    useEffect(() => {
        if (data) {
            setAvatar(data)
        }
    }, [data, error, isLoading, realm, characterName, currentToken?.value])

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
