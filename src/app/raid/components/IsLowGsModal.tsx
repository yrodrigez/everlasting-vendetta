'use client'
import { Button } from "@/app/components/Button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/react";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import GearScore from "@/app/components/GearScore";
import { useCharacterStore } from "@/app/components/characterStore";
import { useShallow } from "zustand/shallow";


export function IsLowGsModal({ isLowGs, characterGearScore, minGs }: {
    isLowGs: boolean,
    characterGearScore: number,
    minGs?: number
}) {
    const { selectedCharacter } = useCharacterStore(useShallow(state => ({ selectedCharacter: state.selectedCharacter })))
    const { isOpen, onOpen, onClose } = useDisclosure()

    const delay = 30000
    const [canClose, setCanClose] = useState(true)
    const [willClose, setWillClose] = useState(delay)

    useEffect(() => {
        if (isLowGs) {
            onOpen()
            setWillClose(delay)
            setCanClose(false)
            new Audio('/sounds/not_enough_level.ogg').play().then().catch()
            const interval = setInterval(() => {

                setWillClose((prevWillClose) => {
                    const nextWillClose = prevWillClose - 1000

                    if (nextWillClose <= 0) {
                        setCanClose(true)
                        clearInterval(interval)
                        return 0
                    }

                    return nextWillClose
                })
            }, 1000)

            return () => clearInterval(interval)
        }
    }, [isLowGs, onOpen])


    return (
        <>
            <div
                className="text-red-600 hover:cursor-pointer cursor-pointer rounded-full"
                onClick={onOpen}>
                <FontAwesomeIcon icon={faTriangleExclamation} beat />
            </div>
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
                                <div
                                    className="
                                        flex gap-1
                                    "
                                >
                                    <p>
                                        Hey <span className="font-bold">{selectedCharacter?.name}</span>, your gear score is
                                        currently</p> {selectedCharacter?.name ? <span><GearScore
                                            characterName={selectedCharacter?.name}
                                            min={minGs}
                                            allowForce={true}
                                        /></span> : characterGearScore} </div> <p>while
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
                                    apply, you may <span className="text-red-600 font-bold">not be included</span> in
                                    the
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
                                    Disclaimer: This is a friendly reminder to ensure fair and efficient raid runs for
                                    all
                                    members. Thank you for your understanding!
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    isDisabled={!canClose}
                                    onPress={onClose}
                                    color="danger">Close {!canClose ? `(${willClose / 1000})` : ''}</Button>
                            </ModalFooter>
                        </>)}
                </ModalContent>
            </Modal>
        </>
    )
}
