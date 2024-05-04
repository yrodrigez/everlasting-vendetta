import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@nextui-org/react";
import {faCircleInfo} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export default function ShowReserveRules() {
    const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure()
    return (
        <>
            <Button
                size={'lg'}
                className={'bg-moss text-gold rounded'}
                isIconOnly
                onClick={onOpen}
            >
                <FontAwesomeIcon icon={faCircleInfo}/>
            </Button>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                placement="center"
                scrollBehavior="inside"
                className="border border-gold scrollbar-pill"
                hideCloseButton
                onOpenChange={onOpenChange}
            >
                <ModalContent>
                    {(onClose) => (
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
                                        <h2 className="font-semibold">2. Duplicate Reservations</h2>
                                        <p>If you reserve the same item twice, you are only eligible to roll against
                                            others who have also reserved that item twice.</p>
                                    </div>
                                    <div className="p-4 bg-moss rounded">
                                        <h2 className="font-semibold">3. Reservation Authority</h2>
                                        <p>Only those who have reserved an item are authorized to roll for it.</p>
                                    </div>
                                    <div className="p-4 bg-moss rounded">
                                        <h2 className="font-semibold">4. Open Rolls for Unreserved Items</h2>
                                        <p>If an item has not been reserved, it is open for all to roll.</p>
                                    </div>
                                    <div className="p-4 bg-moss rounded">
                                        <h2 className="font-semibold">5. Closure of Reservations</h2>
                                        <p>Reservations will be closed at the discretion of the loot master. No
                                            modifications are allowed once closed.</p>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    onClick={onClose}
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
