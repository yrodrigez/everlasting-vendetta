import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCartPlus} from "@fortawesome/free-solid-svg-icons";
import {useSession} from "@/app/hooks/useSession";
import {useRouter} from "next/navigation";

export function ShouldReserveModal({raidId, isOpen, onClose, onOpenChange}: {
    raidId: string,
    isOpen: boolean,
    onClose: () => void,
    onOpenChange: (open: boolean) => void
}) {
    const {selectedCharacter} = useSession()
    const router = useRouter()
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            hideCloseButton
            onOpenChange={onOpenChange}
            isDismissable={false}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            Reserve Your Items
                        </ModalHeader>
                        <ModalBody>
                            {selectedCharacter?.name ? (
                                <p>Hello <span className="font-semibold">{selectedCharacter.name}</span>, you can
                                    reserve your items now to secure what you need for the upcoming events.</p>
                            ) : (
                                <p>Hello! It looks like you haven't selected a character yet. Please choose your
                                    character to start making reservations. It's a great way to ensure you get the
                                    items you need!</p>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                className={'bg-red-600 text-default rounded'}
                                onClick={onClose}
                            >I don't need any loot!</Button>
                            <Button
                                className={'bg-moss text-gold rounded border-2 border-gold border-blink'}
                                onClick={() => {
                                    router.push(`/raid/${raidId}/soft-reserv`)
                                }}
                                endContent={<FontAwesomeIcon icon={faCartPlus}/>}
                            >Reserve items</Button>
                        </ModalFooter>

                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
