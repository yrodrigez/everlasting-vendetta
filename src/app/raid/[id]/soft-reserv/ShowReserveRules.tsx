'use client'
import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@nextui-org/react";
import {faCircleInfo} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useRouter} from "next/navigation";

export default function ShowReserveRules({shouldAlwaysOpen}: {
    shouldAlwaysOpen?: boolean

}) {
    const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure(shouldAlwaysOpen ? {isOpen: shouldAlwaysOpen} : {})
    const [shouldBlink, setShouldBlink] = React.useState(false)
    const router = useRouter()
    useEffect(() => {
        const hasReadTerms = JSON.parse(localStorage?.getItem('hasReadTerms') ?? '{"read":false, "time":0}')
        if (!hasReadTerms.read || hasReadTerms.time <= Date.now() - 1000 * 60 * 60 * 24 * 7) {
            return onOpen()
        }
    }, [isOpen])

    const handleAccept = () => {
        localStorage.setItem('hasReadTerms', JSON.stringify({read: true, time: Date.now()}))
        onClose()
        if (shouldAlwaysOpen) {
            router.push('/')
        }
        setShouldBlink(true)
        setTimeout(() => {
            setShouldBlink(false)
        }, 2100)
    }

    return (
        <>
            {shouldAlwaysOpen ? null : (
                <Button
                    size={'lg'}
                    className={`bg-moss text-gold rounded ${shouldBlink ? 'border-2 border-gold animate-wiggle' : ''}`}
                    isIconOnly
                    onClick={onOpen}
                >
                    <FontAwesomeIcon icon={faCircleInfo}/>
                </Button>
            )}
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                isDismissable={false}
                placement="center"
                scrollBehavior="inside"
                className="border border-gold scrollbar-pill"
                hideCloseButton
                onOpenChange={onOpenChange}
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader>
                                <h1 className="text-2xl font-bold text-center">Reserve Rules</h1>
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <div className="p-4 bg-moss rounded">
                                        <h2 className="font-semibold">1. Item Limit</h2>
                                        <p>Each participant is allowed to reserve a maximum of two items.</p>
                                    </div>
                                    <div className="p-4 bg-moss rounded">
                                        <h2 className="font-semibold">2. Timing of Loot Distribution</h2>
                                        <p>To ensure a fair and organized process, all loot will be distributed at the
                                            conclusion of the raid. We appreciate your understanding and cooperation in
                                            this matter.</p>
                                    </div>
                                    <div className="p-4 bg-moss rounded">
                                        <h2 className="font-semibold">3. Duplicate Reservations</h2>
                                        <p>If you reserve the same item twice, you are only eligible to roll against
                                            others who have also reserved that item twice.</p>
                                    </div>
                                    <div className="p-4 bg-moss rounded">
                                        <h2 className="font-semibold">4. Reservation Authority</h2>
                                        <p>Only those who have reserved an item are authorized to roll for it.</p>
                                    </div>
                                    <div className="p-4 bg-moss rounded">
                                        <h2 className="font-semibold">5. Open Rolls for Unreserved Items</h2>
                                        <p>If an item has not been reserved, it is open for all to roll.</p>
                                    </div>
                                    <div className="p-4 bg-moss rounded">
                                        <h2 className="font-semibold">6. Distribution of Repeated Items</h2>
                                        <p>In cases where multiple identical items are available, these items will be
                                            distributed in a single roll among all participants who have rolled for
                                            them, with priority given to those who rolled the highest numbers. For
                                            example, if there are three participants and two identical items, a single
                                            roll will determine which two participants receive the items, prioritizing
                                            those with the highest rolls.</p>
                                    </div>
                                    <div className="p-4 bg-moss rounded">
                                        <h2 className="font-semibold">7. Legendary Items Distribution</h2>
                                        <p>The distribution of legendary items will be decided by the loot master, with
                                            priority given to long-term members to recognize their contributions and
                                            loyalty.</p>
                                    </div>
                                    <div className="p-4 bg-moss rounded">
                                        <h2 className="font-semibold">8. Closure of Reservations</h2>
                                        <p>Reservations will be closed at the discretion of the loot master. No
                                            modifications are allowed once closed.</p>
                                    </div>
                                    <div className="p-4 bg-moss rounded">
                                        <h2 className="font-semibold">9. Exceptional Cases</h2>
                                        <p>In exceptional cases, the loot master has the discretion to make changes to
                                            loot distribution as deemed necessary.</p>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    onClick={handleAccept}
                                    className={'bg-moss text-default rounded'}
                                >
                                    I understand
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}
