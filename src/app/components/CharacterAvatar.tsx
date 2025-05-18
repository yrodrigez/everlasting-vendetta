'use client'
import {useEffect, useState} from "react";
import {getRoleIcon} from "@/app/apply/components/utils";
import {BNET_COOKIE_NAME} from "@/app/util/constants";
import {getCookie} from "@/app/util";
import {useQuery} from "@tanstack/react-query";
import {Role} from "@/app/admin/types";
import {CharacterRoleType} from "@/app/types/CharacterRole";

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
    role?: CharacterRoleType
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
        {avatar && <img
          width={width}
          height={height}
          src={avatar === 'unknown' ? '/avatar-anon.png' : avatar}
          alt={characterName}
          className={className}
        />}
        {role &&
          <div className={`absolute top-0 -right-3 w-4 h-8`}>
              <div className="relative overflow-visible w-full h-full group">
              {role.split('-').map((r, i) => <img key={i} src={getRoleIcon(r)} alt={r} width={16} height={16}
                className={`absolute top-${i * 4} 
                transition-transform duration-300
                group-hover:translate-y-${i * 4}
                right-0 rounded-full border border-gold`}/>)}
              </div>
            </div>
          }
    </div>
}

export default CharacterAvatar
