'use client'
import {useCallback, useEffect, useRef} from "react";
import {Modal, ModalBody, ModalContent, ModalHeader, useDisclosure} from "@nextui-org/react";
import AvailableCharactersList from "@/app/components/AvailableCharactersList";
import {useCharacterStore} from "@/app/components/characterStore";
import {toast} from "sonner";
import {logout} from "@/app/util";
import {Character} from "@/app/util/blizzard/battleNetWoWAccount/types";
import {GUILD_REALM_NAME} from "@/app/util/constants";
import {useQuery} from "@tanstack/react-query";

async function fetchBattleNetProfile(): Promise<{ characters: Character[] }> {
    const response = await fetch('/api/v1/services/wow/getUserCharacters')
    return await response.json();
}

async function getBnetCharacters(): Promise<Character[] | null> {

    const profile = await fetchBattleNetProfile();
    const {characters} = profile;
    const validCharacters = characters?.filter((character: Character) => character.level >= 10) ?? [];
    return validCharacters.sort((a: Character, b: Character) => b.level - a.level);

}

const useFetchCharacters = (token: { value: string }, onOpen: () => void, logout: (force: any) => void) => {
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
        setCharacters(
            heroes.map(character => ({
                ...character,
                avatar: '/avatar-anon.png',
            }))
        );

        const updatedSelectedCharacter = heroes.find(character => character.id === selectedCharacter?.id);
        const selectedRole = selectedCharacter?.selectedRole;

        if (updatedSelectedCharacter) {
            setSelectedCharacter({
                ...updatedSelectedCharacter,
                avatar: '/avatar-anon.png',
                selectedRole,
                isAdmin: selectedCharacter?.isAdmin
            });
        }

        setLastUpdated(Date.now());
        if (shouldOpen) onOpen();
    }, [onOpen, selectedCharacter, setCharacters, setLastUpdated, setSelectedCharacter]);

    const {data: heroes, error, isFetching} = useQuery({
        queryKey: ['bnetCharacters', token?.value],
        enabled: !!token?.value,
        queryFn: async () => {
            if (selectedCharacter && selectedCharacter.isTemporal) {
                return [{...selectedCharacter}]
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
        if (!token?.value || isFetching || errorOccurred.current || hasFetchedData.current) return;

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
    }, [token?.value, isFetching, error, heroes, errorOccurred, hasFetchedData]);

    useEffect(() => {
        if (!token?.value || isFetching || errorOccurred.current || hasFetchedData.current) return;

        hasFetchedData.current = true;
    }, [token?.value, isFetching, errorOccurred, hasFetchedData]);
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
