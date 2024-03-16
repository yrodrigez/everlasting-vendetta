'use client'
import {useEffect, useState} from "react";
import CharacterAvatar from "@/app/components/CharacterAvatar";
import BattleNetAuthManagerWindow from "@/app/components/BattleNetAuthManagerWindow";
import {useCharacterStore} from "@/app/components/characterStore";

export default function ProfileManager() {
    const [token, setToken] = useState({name: 'bnetToken', value: ''} as any)
    const [open, setOpen] = useState(false)
    const bnetProfile = useCharacterStore(state => state.selectedCharacter)

    useEffect(() => {
        setToken({name: 'bnetToken', value: sessionStorage.getItem('bnetToken') || ''})
    }, [])

    if (!bnetProfile) return null
    return bnetProfile.name !== 'Unknown' && (<>
        <div
            className="px-2 py-1 flex flex-col items-center rounded hover:cursor-pointer hover:bg-white hover:bg-opacity-20 backdrop-filter backdrop-blur-md"
            onClick={() => setOpen(true)}
        >
            <CharacterAvatar
                characterName={bnetProfile.name}
                realm={bnetProfile.realm.slug}
                className="rounded-full w-9 h-9 border border-gold"/>
            <span>{bnetProfile.name}</span>
        </div>
        <BattleNetAuthManagerWindow
            token={token}
            open={open}
            setExternalOpen={setOpen}
        />
    </>)
}
