'use client'
import {Input} from "@nextui-org/react";
import {useApplyFormStore} from "@/app/apply/components/store";
import {useEffect, useState} from "react";


export function CharacterNameInput() {
    const {
        setName,
        setClass,
        setCharacterExists
    } = useApplyFormStore()
    const name = useApplyFormStore(state => state.name)
    const characterExists = useApplyFormStore(state => state.characterExists)
    const [characterAvatar, setCharacterAvatar] = useState('')
    const [isBlurred, setIsBlurred] = useState(false)

    const [level, setLevel] = useState(0)
    const [isWriting, setIsWriting] = useState(false)


    useEffect(() => {
        setCharacterExists(false)
        if ((isBlurred || name.length > 2) && !isWriting) {
            (async () => {
                const response = await fetch(`/api/v1/services/member/avatar/get?characterName=${name}`)
                const data = await response.json()

                if (!data.avatar || data.avatar === 'unknown') {
                    return setCharacterAvatar('')
                }

                setCharacterAvatar(data.avatar)

                const characterInfoResponse = await fetch(`/api/v1/services/member/character?characterName=${name}`)
                const characterInfoData = await characterInfoResponse.json()
                if (characterInfoData.error) return

                const characterClass = characterInfoData?.character?.character_class?.name ?? ''
                if (!characterClass) return

                setClass(characterClass)
                setLevel(characterInfoData.character.level)
                setCharacterExists(true)
            })()
        }
        if (isBlurred && name.length <= 2) {
            setCharacterAvatar('')
        }
    }, [isBlurred, name]);

    return (
        <div
            className={`relative`}>
            <Input
                onFocus={() => setIsBlurred(false)}
                onBlur={() => {
                    setIsBlurred(true)
                    setIsWriting(false)
                }}
                onInput={() => {
                    setIsWriting(true)
                }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                label="Character's name *" id="character-name"
                required
                validate={() => {
                    if (name && name.length >= 3 && characterExists) {
                        return true
                    }

                    return 'invalid character name'
                }}
            />
            {characterAvatar &&
              <div className="w-10 h-10 bg-red-500 absolute top-2.5 -right-12 rounded-full border border-green-500"
                   style={{
                       backgroundImage: `url(${characterAvatar})`,
                       backgroundSize: 'cover',
                       backgroundPosition: 'center',
                       backgroundRepeat: 'no-repeat'
                   }}>

                <div className="relative">
                  <span className="absolute -bottom-16 right-2">
                      {level || null}
                  </span>
                </div>

              </div>
            }
        </div>
    )
}
