'use client'
import { useCharacterStore } from "@/app/components/characterStore";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useAuthManagerWindowStore } from "../stores/auth-manager-window-store";
import { CharacterSelection } from "./character-selection/character-selection";

export function AuthManagerWindow() {
    const isOpen = useAuthManagerWindowStore(state => state.isOpen);
    const onOpenChange = useAuthManagerWindowStore(state => state.onOpenChange);
    const selectedCharacter = useCharacterStore(state => state.selectedCharacter);
    const { user } = useAuth();
    const isBattleNetUser = useMemo(() => user?.provider?.indexOf('bnet') !== -1, [user]);

    return (
        <Modal
            isOpen={isOpen}
            size="md"
            onOpenChange={onOpenChange}
            backdrop="blur"
            hideCloseButton={!selectedCharacter?.selectedRole}
            placement="center"
            isDismissable={!!selectedCharacter?.selectedRole}>
            <ModalContent className={
                `bg-wood`
            }>
                {() => (
                    <>
                        <ModalHeader>
                            {selectedCharacter?.name ? 'Manage your characters' : 'Select a character to continue'}
                        </ModalHeader>
                        <ModalBody className="overflow-auto scrollbar-pill flex">
                            <div className="flex flex-col gap-4">
                                <CharacterSelection isBattlenet={isBattleNetUser} />
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
