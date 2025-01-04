'use client'
import {useSession} from "@hooks/useSession";
import {Button} from "@/app/components/Button";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@nextui-org/react";
import {useEffect, useState} from "react";


export function IsLowGsModal({isLowGs, characterGearScore, minGs}: {
    isLowGs: boolean,
    characterGearScore: number,
    minGs?: number
}) {
    const {supabase, selectedCharacter} = useSession()
    const {isOpen, onOpen, onClose} = useDisclosure()

    const [canClose, setCanClose] = useState(false)
    const [willClose, setWillClose] = useState(28000)

    useEffect(() => {
        if (isLowGs) {
            onOpen()
        }
        setTimeout(() => {
            setCanClose(true)
        }, 30000)

        const interval = setInterval(() => {
            setWillClose((prev) => prev - 1000)
            if(willClose <= 0) {
                clearInterval(interval)
            }
        }, 1000)

        return () => {
            clearInterval(interval)
        }
    }, [isLowGs, selectedCharacter, supabase, characterGearScore])

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Low Gear Score"
               isDismissable={canClose}
               hideCloseButton={!canClose}>
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader>
                            <h2 className="text-xl font-bold">Low Gear Score</h2>
                        </ModalHeader>
                        <ModalBody>
                            <p>
                                Hey <span className="font-bold">{selectedCharacter?.name}</span>, your gear score is
                                currently <span className="text-red-600 font-bold">{characterGearScore}</span>, while
                                the minimum recommended gear score for this raid is <span
                                className="text-red-600 font-bold">{minGs}</span>.
                            </p>
                            <p>
                                <span className="font-bold">Reminder:</span> You can still sign up, but <span
                                className="text-yellow-600 font-bold">priority will be given</span> to
                                guild members who meet the gear score requirement, especially since our raids are
                                typically limited to <span className="font-bold">20–25 participants</span>.
                            </p>
                            <p>
                                If more players sign up than available spots, or if others with higher gear scores
                                apply, you may <span className="text-red-600 font-bold">not be included</span> in the
                                raid group. If you do participate, your <span className="text-yellow-600 font-bold">loot priority</span> may
                                be adjusted, meaning you may only roll for items that <span className="font-bold">other geared members do not need</span>.
                            </p>
                            <p>
                                If you really want to join, we recommend reaching out to the <span
                                className="font-bold">raid leader</span> to discuss your inclusion.
                            </p>
                            <p>
                                If you believe this is a mistake or have any questions, please contact an <span
                                className="font-bold">officer</span> for clarification.
                            </p>
                            <p className="text-yellow-600 font-bold">
                                Disclaimer: This is a friendly reminder to ensure fair and efficient raid runs for all
                                members. Thank you for your understanding!
                            </p>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                isDisabled={!canClose}
                                onPress={onClose} color="danger">Close {!canClose ? `(${willClose/1000})`: ''}</Button>
                        </ModalFooter>
                    </>)}
            </ModalContent>
        </Modal>
    )
}
