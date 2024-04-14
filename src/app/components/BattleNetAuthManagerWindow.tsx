'use client'
import {useEffect, useState} from "react";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@nextui-org/react";
import AvailableCharactersList from "@/app/components/AvailableCharactersList";
import {useCharacterStore} from "@/app/components/characterStore";

async function fetchBattleNetProfile(token: string) {
    const url = 'https://eu.api.blizzard.com/profile/user/wow?namespace=profile-classic1x-eu&locale=en_US'
    const headers = new Headers()
    headers.append('Authorization', 'Bearer ' + token)

    const response = await fetch(url, {
        headers: headers
    });

    return await response.json();
}

function filterAccountWithValidCharacters(profile: any) {
    return profile?.wow_accounts.filter((account: any) => {
        return account.characters.some((character: any) => character.realm.slug === 'lone-wolf' && character.level >= 10)
    }).reduce((acc: any, account: any) => {
        acc.characters.push(...account.characters.filter((character: any) => character.realm.slug === 'lone-wolf' && character.level >= 10))
        return acc
    }, {characters: []})
}

async function setBnetCharacters(token: string, setCharacters: (profile: any) => void) {
    const profile = await fetchBattleNetProfile(token)

    const characters = filterAccountWithValidCharacters(profile)?.characters.sort((a: any, b: any) => b.level - a.level)

    setCharacters(characters)
}

export default function BattleNetAuthManagerWindow({token, open, setExternalOpen}: {
    token: { name: string, value: string },
    open?: boolean,
    setExternalOpen?: (value: boolean) => void
}) {
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
    const characters = useCharacterStore(state => state.characters)
    const selectedCharacter = useCharacterStore(state => state.selectedCharacter)
    const setSelectedCharacter = useCharacterStore(state => state.setSelectedCharacter)
    const setCharacters = useCharacterStore(state => state.setCharacters)
    const lastUpdated = useCharacterStore(state => state.lastUpdated)
    const setLastUpdated = useCharacterStore(state => state.setLastUpdated)

    useEffect(() => {
        if (lastUpdated < (Date.now() - 60000)) {
            if (token?.value) {
                setBnetCharacters(token.value, setCharacters).then(() => {
                    setLastUpdated(Date.now())
                })
            }
        }
    }, [token?.value, setCharacters, lastUpdated, setLastUpdated]);

    useEffect(() => {
        sessionStorage.setItem('bnetToken', token.value)
        if (token && !selectedCharacter) {
            setBnetCharacters(token.value, setCharacters).then(() => {
                const storedCharacter = JSON.parse(localStorage.getItem('bnetProfile') || '{}')
                if (!storedCharacter?.state?.selectedCharacter)
                    onOpen()
            })
        }

    }, [selectedCharacter, token?.value, setCharacters, onOpen]);


    return (
        <Modal
            isOpen={open || isOpen}
            size="xs"
            onOpenChange={onOpenChange}
            backdrop="blur"
            hideCloseButton
            placement="center"
            isDismissable={!!selectedCharacter}>
            <ModalContent className={
                `bg-wood max-h-96`
            }>
                {() => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h1 className={'text-gold font-bold text-2xl'}>Select your hero</h1>
                        </ModalHeader>
                        <ModalBody className="max-h-96 overflow-auto scrollbar-pill">
                            <div className="flex flex-col gap-4">
                                <AvailableCharactersList
                                    characters={characters}
                                    onCharacterSelect={(character) => {
                                        setSelectedCharacter({...character})
                                        setExternalOpen && setExternalOpen(false)
                                        onClose()
                                        window.location.reload()
                                    }}/>
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
