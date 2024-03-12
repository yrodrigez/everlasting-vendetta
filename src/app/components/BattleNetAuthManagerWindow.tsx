'use client'
import {useEffect, useState} from "react";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@nextui-org/react";
import AvailableCharactersList from "@/app/components/AvailableCharactersList";

function getBattleNetTokenFromCookie() {
    if (!document?.cookie) return null
    return document.cookie.split(';').find((cookie: string) => {
        return cookie.startsWith('bnetToken')
    })?.split('=')[1]
}

function isBattleNetProfileSet() {
    return localStorage.getItem('bnetProfile') !== null
}

async function fetchBattleNetProfile(token: string) {
    const url = 'https://eu.api.blizzard.com/profile/user/wow?namespace=profile-classic1x-eu&locale=en_US'
    const headers = new Headers()
    headers.append('Authorization', 'Bearer ' + token)

    const response = await fetch(url, {
        headers: headers
    });

    return await response.json();
}

function saveAvailableCharacters(characters: any) {
    localStorage?.setItem('availableCharacters', JSON.stringify(characters))
}

async function setBnetCharacters(token: string, setCharacters: (profile: any) => void) {
    const profile = await fetchBattleNetProfile(token)

    let {characters} = profile?.wow_accounts[0]
    characters = characters.filter((character: any) => character.realm.slug === 'lone-wolf').sort((a: any, b: any) => b.level - a.level)
    saveAvailableCharacters(characters)
    setCharacters(characters)
}

function saveSelectedProfile(character: any) {
    localStorage.setItem('bnetProfile', JSON.stringify(character))
    window.location.reload()
}

export default function BattleNetAuthManagerWindow({token, open, onCharacterSelect}: {
    token: { name: string, value: string },
    open?: boolean,
    onCharacterSelect?: (character: any) => void
}) {
    if (!onCharacterSelect) onCharacterSelect = saveSelectedProfile
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
    const [characters, setCharacters] = useState([])
    useEffect(() => {
        setCharacters(JSON.parse(window.localStorage.getItem('availableCharacters') || '[]'))
        sessionStorage.setItem('bnetToken', token.value)
        if (token && !isBattleNetProfileSet()) {
            setBnetCharacters(token.value, setCharacters).then(() => {
                onOpen()
            })
        }
    }, []);

    return (
        <Modal
            isOpen={open || isOpen}
            size="xs"
            onOpenChange={onOpenChange}
            backdrop="blur"
            hideCloseButton
            isDismissable={false}>
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
                                <AvailableCharactersList characters={characters} onCharacterSelect={(character) => {
                                    onCharacterSelect && onCharacterSelect(character)
                                    onClose()
                                }}/>
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
