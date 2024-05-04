import {getRoleIcon} from "@/app/apply/components/utils";
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    useDisclosure
} from "@nextui-org/react";
import {useAssistanceStore} from "@/app/raid/components/assistanceStore";
import {useSession} from "@/app/hooks/useSession";
import {useState} from "react";
import {assistRaid} from "@/app/raid/components/utils";
import {useRouter} from "next/navigation";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCartPlus} from "@fortawesome/free-solid-svg-icons";


export function ConfirmAssistance({raidId, hasLootReservations = false}: {
    raidId: string,
    hasLootReservations?: boolean
}) {
    const selectedDays = useAssistanceStore(state => state.selectedDays)
    const {selectedCharacter} = useSession()
    const selectedRole = selectedCharacter?.selectedRole
    const [loading, setLoading] = useState(false)
    const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure()
    const router = useRouter()
    return (
        <>
            <Button
                disabled={loading || !selectedDays?.length}
                isDisabled={loading || !selectedDays?.length}
                className={'bg-moss text-gold'}
                onClick={() => {
                    (async () => {
                        setLoading(true)
                        await assistRaid(raidId, selectedDays, selectedCharacter, selectedRole, 'confirmed')
                        if (!hasLootReservations) {
                            onOpen()
                            const noLootAudio = new Audio('/sounds/uEscapeScreenOpen.ogg')
                            noLootAudio.play().then(() => {
                            }).catch((reason) => {
                                console.error(reason)
                            })
                        }
                        setLoading(false)
                    })()
                }}
                endContent={loading ? <Spinner size='sm' color='success'/> : selectedRole &&
                  <img className="w-6 h-6 rounded-full border border-gold"
                       src={getRoleIcon(selectedRole)} alt={selectedRole}/>}
            >Confirm as {selectedRole}
            </Button>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                hideCloseButton
                onOpenChange={onOpenChange}
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
        </>
    )
}
