'use client'
import {useEffect, useRef, useState} from "react";
import {Modal, ModalBody, ModalContent, ModalHeader, useDisclosure} from "@nextui-org/react";
import AvailableCharactersList from "@/app/components/AvailableCharactersList";
import {useCharacterStore} from "@/app/components/characterStore";
import {toast} from "sonner";
import {logout} from "@/app/util";
import {Character} from "@/app/util/blizzard/battleNetWoWAccount/types";
import {GUILD_REALM_NAME} from "@/app/util/constants";

async function fetchBattleNetProfile(): Promise<{ characters: Character[] }> {
    const response = await fetch(window.location.origin + '/api/v1/services/wow/getUserCharacters')

    return await response.json();
}

async function getBnetCharacters(): Promise<Character[] | null> {
    try {
        const profile = await fetchBattleNetProfile()
        const {characters} = profile

        const validCharacters = characters?.filter((character: Character) => character.level >= 10) ?? []

        return (validCharacters.sort((a: Character, b: Character) => b.level - a.level))
    } catch (e) {
        toast.error('Failed to fetch profile from Battle.net', {
            duration: 2500,
            onDismiss: logout,
            onAutoClose: logout
        })
        return null
    }
}

const useFetchCharacters = (token: { value: string }, onOpen: () => void, logout: (force: any) => void) => {
    const setCharacters = useCharacterStore(state => state.setCharacters);
    const selectedCharacter = useCharacterStore(state => state.selectedCharacter);
    const setSelectedCharacter = useCharacterStore(state => state.setSelectedCharacter);
    const lastUpdated = useCharacterStore(state => state.lastUpdated);
    const setLastUpdated = useCharacterStore(state => state.setLastUpdated);
    const clearCharacterStore = useCharacterStore(state => state.clear);

    const hasFetchedData = useRef(false);
    const errorOccurred = useRef(false);

    const handleError = (message: string) => {
        toast.error(message, {
            duration: 3500,
            onDismiss: () => logout(true),
            onAutoClose: () => logout(true),
        });
        errorOccurred.current = true;
        clearCharacterStore();
        errorOccurred.current = false;
    };

    const updateCharacters = (heroes: Character[], shouldOpen: boolean) => {
        setCharacters(
            heroes.map(character => ({
                ...character,
                avatar: '/avatar-anon.png',
            }))
        );

        const updatedSelectedCharacter = heroes.find(character => character.id === selectedCharacter?.id);
        const selectedRole = selectedCharacter?.selectedRole;

        if (updatedSelectedCharacter) {
            setSelectedCharacter({...updatedSelectedCharacter, avatar: '/avatar-anon.png', selectedRole});
        }

        setLastUpdated(Date.now());
        if (shouldOpen) onOpen();
    };

    useEffect(() => {
        if (!token?.value) return;
        if (lastUpdated >= Date.now() - 60000 && selectedCharacter) return;
        if (hasFetchedData.current) return;
        if (errorOccurred.current) return;

        const fetchCharacters = async () => {
            hasFetchedData.current = true;

            try {
                const heroes = await getBnetCharacters();

                if (!heroes?.length) {
                    handleError(`No characters found on your account in the realm '${GUILD_REALM_NAME}' please make sure you are using the right account`);
                    return;
                }


                const shouldOpen = !useCharacterStore.getState().selectedCharacter || !heroes.find(character => character.id === useCharacterStore.getState().selectedCharacter?.id);
                updateCharacters(heroes, shouldOpen);

            } catch (error) {
                toast.error('Error fetching data');
            } finally {
                hasFetchedData.current = false;
            }
        };

        fetchCharacters().then();
    }, [token?.value, lastUpdated, selectedCharacter, setCharacters, setLastUpdated, setSelectedCharacter, onOpen, clearCharacterStore, logout]);

};


export function BattleNetAuthManagerWindow({token, open, setExternalOpen}: {
    token: { name: string, value: string },
    open?: boolean,
    setExternalOpen?: (value: boolean) => void
}) {
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
    const characters = useCharacterStore(state => state.characters);
    const selectedCharacter = useCharacterStore(state => state.selectedCharacter);
    const setSelectedCharacter = useCharacterStore(state => state.setSelectedCharacter);

    useFetchCharacters(token, onOpen, logout);

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
                                    }}/>
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
