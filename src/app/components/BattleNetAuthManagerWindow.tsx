'use client'
import AvailableCharactersList from "@/app/components/AvailableCharactersList";
import { useCharacterStore } from "@/app/components/characterStore";
import { logout } from "@/app/util";
import { Character } from "@/app/util/blizzard/battleNetWoWAccount/types";
import { GUILD_REALM_NAME } from "@/app/util/constants";
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import api from "../lib/axios";

async function getBnetCharacters(): Promise<Character[] | null> {
    const { data: { characters } } = await api.get('/user-characters')
    console.log('Fetched characters from Battle.net:', characters);
    const validCharacters = characters?.filter((character: Character) => character.level >= 10) ?? [];
    return validCharacters.sort((a: Character, b: Character) => b.level - a.level);
}

const useFetchCharacters = (onOpen: () => void, logout: (force: any) => void) => {
    const setCharacters = useCharacterStore(state => state.setCharacters);
    const selectedCharacter = useCharacterStore(state => state.selectedCharacter);
    const setSelectedCharacter = useCharacterStore(state => state.setSelectedCharacter);
    const setLastUpdated = useCharacterStore(state => state.setLastUpdated);
    const clearCharacterStore = useCharacterStore(state => state.clear);

    const hasFetchedData = useRef(false);
    const errorOccurred = useRef(false);

    const handleError = useCallback((message: string) => {
        toast.error(message, {
            duration: 3500,
            onDismiss: () => logout(true),
            onAutoClose: () => logout(true),
        });
        errorOccurred.current = true;
        clearCharacterStore();
        errorOccurred.current = false;
    }, [clearCharacterStore, logout]);

    const updateCharacters = useCallback((heroes: any[], shouldOpen: boolean) => {
        setCharacters(heroes);

        const updatedSelectedCharacter = heroes.find(character => character.id === selectedCharacter?.id);
        const selectedRole = selectedCharacter?.selectedRole;

        if (updatedSelectedCharacter) {
            setSelectedCharacter({
                ...updatedSelectedCharacter,
                selectedRole,
            });
        }

        setLastUpdated(Date.now());
        if (shouldOpen) onOpen();
    }, [onOpen, selectedCharacter, setCharacters, setLastUpdated, setSelectedCharacter]);

    const { data: heroes, error, isFetching } = useQuery({
        queryKey: ['bnetCharacters'],
        queryFn: async () => {
            if (selectedCharacter && selectedCharacter.isTemporal) {
                return [{ ...selectedCharacter }]
            }

            return (await getBnetCharacters())?.map(character => ({
                ...character,
                isAdmin: selectedCharacter?.isAdmin && selectedCharacter.id === character.id,
            }));
        },
        retry: (failureCount, error) => {
            const MAX_COUNT = 8;
            console.error('Error fetching data:', error);
            if (failureCount > MAX_COUNT) {
                toast.error('Failed to fetch profile from Battle.net', {
                    duration: 2500,
                    onDismiss: logout,
                    onAutoClose: logout
                });
                return false;
            }
            return failureCount < MAX_COUNT;
        },
    });

    useEffect(() => {
        if (isFetching || errorOccurred.current || hasFetchedData.current) return;

        if (heroes) {
            if (!heroes?.length) {
                handleError(`No characters found on your account in the realm '${GUILD_REALM_NAME}' please make sure you are using the right account`);
                return;
            }

            const shouldOpen = !useCharacterStore.getState().selectedCharacter || !heroes.find(character => character.id === useCharacterStore.getState().selectedCharacter?.id);
            updateCharacters(heroes, shouldOpen);
            hasFetchedData.current = false;
        } else if (error) {
            console.error('Error fetching data:', error);
            toast.error('Error fetching data');
            hasFetchedData.current = false;
        }

        hasFetchedData.current = true;
    }, [isFetching, error, heroes, errorOccurred, hasFetchedData]);

    useEffect(() => {
        if (isFetching || errorOccurred.current || hasFetchedData.current) return;

        hasFetchedData.current = true;
    }, [isFetching, errorOccurred, hasFetchedData]);
};

export function BattleNetAuthManagerWindow({ open, setExternalOpen }: {
    open?: boolean,
    setExternalOpen?: (value: boolean) => void
}) {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const characters = useCharacterStore(state => state.characters);
    const selectedCharacter = useCharacterStore(state => state.selectedCharacter);
    const setSelectedCharacter = useCharacterStore(state => state.setSelectedCharacter);

    useEffect(() => {
        if (open) {
            onOpen();
        }
    }, [open]);

    useFetchCharacters(onOpen, logout);

    return (
        <Modal
            isOpen={open || isOpen}
            size="xs"
            onOpenChange={onOpenChange}
            backdrop="blur"
            hideCloseButton
            placement="center"
            isDismissable={selectedCharacter?.name ? true : false}>
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
                                        setSelectedCharacter({ ...character })
                                        setExternalOpen && setExternalOpen(false)
                                        onClose()
                                    }} />
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
