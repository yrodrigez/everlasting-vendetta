'use client'
import { getRoleIcon } from "@/app/apply/components/utils";
import { CharacterRoleType } from "@/app/types/CharacterRole";
import { useEffect, useState } from "react";
import { useCharacterAvatar } from "../hooks/api/use-character-avatar";

const CharacterAvatar = ({
    token,
    realm,
    characterName,
    className = `rounded-full md:w-24 w-16 border-2 border-gold`,
    width = 80,
    height = 80,
    role,
    avatarUrl
}: {
    token?: { name: string, value: string } | string,
    realm: string,
    characterName: string,
    width?: number,
    height?: number,
    className?: string,
    role?: CharacterRoleType,
    avatarUrl?: string
}) => {

    const [avatar, setAvatar] = useState(avatarUrl ?? '/avatar-anon.png');
    const { avatar: data, error, isLoading } = useCharacterAvatar(realm, characterName)

    useEffect(() => {
        if (avatarUrl) {
            setAvatar(avatarUrl)
            return
        }
        if (data) {
            setAvatar(data.avatarUrl)
        }
    }, [data, error, isLoading, realm, characterName])

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
                        className={`absolute top-${i * 2} 
                transition-transform duration-300
                group-hover:translate-y-${i * 3}
                right-0 rounded-full border border-gold`} />)}
                </div>
            </div>
        }
    </div>
}

export default CharacterAvatar
