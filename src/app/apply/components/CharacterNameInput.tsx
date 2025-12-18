'use client'
import { useApplyFormStore } from "@/app/apply/components/store";
import { useFetchCharacter } from "@/app/hooks/api/use-fetch-character";
import { Input } from "@/app/components/input";
import { Tooltip } from "@/app/components/tooltip";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";

export function CharacterNameInput({ isDisabled }: { isDisabled: boolean }) {
    const {
        setName,
        setClass,
        setCharacterExists
    } = useApplyFormStore(useShallow(state => ({
        setName: state.setName,
        setClass: state.setClass,
        setCharacterExists: state.setCharacterExists
    })))

    const name = useApplyFormStore(state => state.name)
    const characterExists = useApplyFormStore(state => state.characterExists)
    const realm = useApplyFormStore(state => state.realm)
    const [characterAvatar, setCharacterAvatar] = useState('')
    const [isBlurred, setIsBlurred] = useState(false)

    const [level, setLevel] = useState(0)
    const [isWriting, setIsWriting] = useState(false)

    const { fetchCharacter, character } = useFetchCharacter()

    useEffect(() => {
        setCharacterExists(false)
        if ((isBlurred || name.length > 2) && !isWriting && realm) {
            fetchCharacter({ realm, name })
        }
        if (isBlurred && name.length <= 2) {
            setCharacterAvatar('')
        }
    }, [isBlurred, name, isWriting, realm, fetchCharacter, setCharacterExists]);

    useEffect(() => {
        if (character) {
            setCharacterAvatar(character.avatar)
            setClass(character.character_class.name)
            setLevel(character.level)
            setCharacterExists(true)
        } else {
            setCharacterAvatar('')
            setClass('')
            setLevel(0)
            setCharacterExists(false)
        }
    }, [character]);

    return (
        <div
            className={`relative`}>
            <Tooltip
                content={isDisabled ? 'Select a realm first' : null}
                hidden={!isDisabled}
                placement="right"
            >
                <div>
                    <Input
                        isDisabled={isDisabled}
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
                            if (name?.length >= 3 || characterExists) {
                                return ''
                            }

                            return 'Invalid character name'
                        }}
                    />
                </div>
            </Tooltip>
            {characterAvatar &&
                <div className="absolute top-2.5 -right-12 w-10 flex flex-col items-center">
                    <div 
                        className="w-10 h-10 rounded-full border border-green-500"
                        style={{
                            backgroundImage: `url(${characterAvatar})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }}
                    />
                    <span className="text-xs text-gold mt-1 font-bold">
                        {level}
                    </span>
                </div>
            }
        </div>
    )
}
