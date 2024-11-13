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


    const terms = [
        {
            header: 'Reservation Authority',
            content: 'Only those who have reserved an item are authorized to roll for it.'
        },
        {
            header: 'Open Rolls for Unreserved Items',
            content: 'If an item has not been reserved, it is open for all participants to roll.'
        },
        {
            header: 'Closure of Reservations',
            content: 'Reservations will be closed at the discretion of the loot master. No modifications are allowed once closed.'
        },
        {
            header: 'Duplicate Reservations',
            content: `Participants who reserve the same item multiple times will receive priority over those who reserve it fewer times. Here’s how it works:`,
            details: [
                {
                    header: 'Reservation Count',
                    content: 'If you reserve an item twice, you are only eligible to roll against other participants who have also reserved that item twice. This means that participants who reserved an item multiple times have priority over those who reserved it only once.'
                },
                {
                    header: 'Priority in Rolling',
                    content: 'If a participant with a single reservation rolls against a participant with multiple reservations, the participant with more reservations will have priority for that item, even if their roll result is lower.'
                }
            ]
        },
        {
            header: 'Plus One System (+1)',
            content: 'The +1 system is designed to balance loot distribution by tracking and slightly prioritizing those who haven’t won recently, ensuring a fairer spread of items over time. We use a "plus one" system that applies only to Main Spec (MS) rolls. This system does not impact Off Spec (OS) or Reserved (SR) items. If a participant mistakenly rolls for an MS item as OS, the loot master reserves the right to apply a +1 to correct the roll.',
            details: [
                {
                    header: 'Accumulating +1:',
                    content: 'Each time a player wins a roll for a Main Spec (MS) item, they receive a “+1” mark. This mark does not prevent them from rolling again but impacts their priority in future rolls.'
                },
                {
                    header: 'Effect of +1:',
                    content: 'When a player with a +1 rolls for an MS item, they will be given lower priority compared to players who do not have a +1, even if they roll higher. This means a participant without a +1 will win over someone with a +1.'
                },
                {
                    header: 'Main Spec Focus:',
                    content: 'The +1 system applies exclusively to MS rolls, so Off Spec (OS) and Reserved (SR) items are unaffected, keeping the focus on distributing essential items among primary roles.'
                },
                {
                    header: 'Mistaken Rolls',
                    content: 'To prevent accidental misuse of the system, if a participant mistakenly rolls for an MS item as Off Spec (OS), the loot master reserves the right to apply a +1 to correct the roll, ensuring it counts appropriately toward MS priority.'
                }
            ]
        },
        {
            header: 'Late Arrivals and Loot Eligibility',
            content: 'Participants who join the raid after it has begun will receive a +1 penalty on their loot rolls. Ensuring priority for those who were present from the start while still allowing latecomers a fair chance at unreserved items. The +1 penalty will be assigned a discretion of the loot master or raid leader.'
        },
        {
            header: 'No-Loot Extra Reserve',
            content: 'To ensure everyone has a fair chance at receiving loot, any participant who does not receive any items during a raid run will be granted a one-time extra reserve for the next raid of the same type (affects PUG\'s). Here’s how it works:',
            details: [
                {
                    header: 'Extra Reserve Eligibility:',
                    content: 'If a participant completes a raid without winning any loot, they will receive one additional reserve slot for the next reset of that specific raid (e.g., an extra reserve in Blackwing Lair (BWL) would apply only to the next BWL run, not to Molten Core (MC) or other raids).'
                },
                {
                    header: 'One-Time Use:',
                    content: 'This extra reserve can only be used in the most immediate upcoming raid of that type. If the player does not use it in the next available raid, it will expire and cannot be carried over to future raids.'
                },
                {
                    header: 'Limitations:',
                    content: 'The extra reserve is valid only for the next raid of the same type and cannot be transferred or saved for other raid types or later runs.'
                }
            ]
        },
        {
            header: 'Distribution of Repeated Items',
            content: 'In cases where multiple identical items are available, these items will be distributed in a single roll among all participants who have rolled for them, with priority given to those who rolled the highest numbers. For example, if there are three participants and two identical items, a single roll will determine which two participants receive the items, prioritizing those with the highest rolls.'
        },
        {
            header: 'Timing of Loot Distribution',
            content: 'To ensure a fair and organized process, all loot will be distributed at the conclusion of the raid. We appreciate your understanding and cooperation in this matter.'
        },
        {
            header: 'Legendary Items Distribution',
            content: 'The distribution of legendary items will be decided by the loot master, with priority given to long-term members to recognize their contributions and loyalty.'
        },
        {
            header: 'Special Items and Materials',
            content: 'All Bind on Equip (BOE) items, farming materials, and quest-related items such as the Head of Broodlord Lashlayer are hard reserved. The distribution of these items will be decided by the loot master, guild master, and raid leader.'
        },
        {
            header: 'Exceptional Cases',
            content: 'In exceptional cases, the loot master or raid leader, has the discretion to make changes to loot distribution as deemed necessary.'
        },
    ]

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
                className="border border-wood-100"
                hideCloseButton
                onOpenChange={onOpenChange}
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader>
                                <h1 className="text-2xl font-bold text-center">Reserve Rules</h1>
                            </ModalHeader>
                            <ModalBody className="scrollbar-pill">
                                <div className="space-y-4">
                                    {terms.map((term, index) => (
                                        <div key={index} className="p-4 bg-moss rounded border-moss-100 border">
                                            <h2 className="font-semibold mb-2">{index + 1}. {term.header}</h2>
                                            <p>{term.content}</p>
                                            {term.details?.map((detail, jindex) => (
                                                <div key={jindex} className="px-4 py-2 bg-moss rounded">
                                                    <h3 className="font-semibold mb-2">{index + 1}.{jindex + 1}. {detail.header}</h3>
                                                    <p>{detail.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    onClick={handleAccept}
                                    className={'bg-moss text-default rounded border border-moss-100 font-bold'}
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
