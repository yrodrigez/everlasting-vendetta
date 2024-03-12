'use client'
import {useEffect, useState} from "react";
import CharacterAvatar from "@/app/components/CharacterAvatar";
import BattleNetAuthManagerWindow from "@/app/components/BattleNetAuthManagerWindow";

export default function ProfileManager() {
    const [bnetProfile, setBnetProfile] = useState({name: 'Unknown', realm: {slug: 'unknown'}} as any)
    const [token, setToken] = useState({name: 'bnetToken', value: ''} as any)
    const [open, setOpen] = useState(false)
    useEffect(() => {
        setToken({name: 'bnetToken', value: sessionStorage.getItem('bnetToken') || ''})
        const profile = JSON.parse(localStorage.getItem('bnetProfile') || 'null')
        if (profile) setBnetProfile(profile)
    }, []);

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
            onCharacterSelect={(character: any) => {
                setBnetProfile(character)
                setOpen(false)
            }}
        />
    </>)
}
