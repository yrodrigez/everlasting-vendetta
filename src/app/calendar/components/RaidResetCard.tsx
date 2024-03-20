'use client'
import moment from "moment";
import {
    Card,
    CardBody,
    Image,
    Button,
    Tooltip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter, useDisclosure
} from "@nextui-org/react"
import {useEffect, useState} from "react";
import {UsersIcon} from "@/app/calendar/components/UsersIcon";
import {useCharacterStore} from "@/app/components/characterStore";
import {ConfirmDecline} from "@/app/calendar/components/ConfirmDecline";

const CURRENT_MAX_LEVEL = 40

async function fetchRaidMembers(id: string) {
    const res = await fetch(`/api/v1/services/calendar/raid/status?id=${id}`)
    const data = await res.json()
    if (data.error) console.error(data.error)

    return data
}

async function confirmRaid(id: string, isConfirmed: boolean, currentCharacter: any) {
    const res = await fetch('/api/v1/services/calendar/raid/confirm', {
        method: 'POST',
        body: JSON.stringify({
            id,
            isConfirmed,
            currentCharacter,
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })

    const data = await res.json()
    if (data.error) console.error(data.error)

    return data
}

export function RaidResetCard({raidDate, raidName, raidImage, raidTime = '20:30', id, loggedInUser}: {
    id: string,
    raidDate: string,
    raidName: string,
    raidImage: string,
    raidTime?: string,
    loggedInUser: any
}) {
    const [isConfirming, setIsConfirming] = useState(false)
    const [isDeclining, setIsDeclining] = useState(false)
    const [raidRegistrations, setRaidRegistrations] = useState([])
    const [isCharMaxLevel, setIsCharMaxLevel] = useState(false)
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const currentCharacter = useCharacterStore(state => state.selectedCharacter)
    const [isConfirmed, setIsConfirmed] = useState(false)
    const [isDeclined, setIsDeclined] = useState(false)
    const [daysToGo, setDaysToGo] = useState(0)

    useEffect(() => {
        fetchRaidMembers(id).then((data) => {
            setRaidRegistrations(data)
            setIsConfirmed(data?.find((member: any) => {
                return member?.member?.id === currentCharacter?.id && member.is_confirmed
            }))
            setIsDeclined(data?.find((member: any) => {
                return member?.member?.id === currentCharacter?.id && !member.is_confirmed
            }))
        })
    }, [id, currentCharacter])

    useEffect(() => {
        setIsCharMaxLevel(currentCharacter?.level === CURRENT_MAX_LEVEL)
    }, [currentCharacter])

    useEffect(() => {
        setDaysToGo(moment(raidDate).diff(moment(), 'days'))
    }, [raidDate]);


    return (
        <>
            <Card className="bg-wood border-none w-[300px] h-[225px]" radius="lg">
                <Image
                    alt="Card background"
                    className="object-cover"
                    src={raidImage}
                    width={300}
                    height={300}
                />
                <div
                    className="border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large top-0 w-full h-full z-10 bg-[rgba(19,19,19,.78)] backdrop-filter backdrop-blur-xs items-start flex flex-col gap-2 p-3">
                    <h4 className="font-bold text-large text-gold">{raidName}</h4>
                    <small className="text-primary">{raidDate} - {raidTime}</small>
                    <small className={`text-primary ${daysToGo > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {daysToGo > 0 ? `In ${daysToGo} days` : 'Today'}
                    </small>
                    <small className="text-primary">Confirmed: {raidRegistrations?.filter((member: any) => {
                        return member.is_confirmed
                    }).length}</small>
                    <small className="text-primary">Declined: {raidRegistrations?.filter((member: any) => {
                        return !member.is_confirmed
                    }).length}</small>
                    <CardBody className="absolute bottom-1 left-0">
                        <ConfirmDecline
                            id={id}
                            isConfirming={isConfirming}
                            isDeclining={isDeclining}
                            setIsConfirming={setIsConfirming}
                            setIsDeclining={setIsDeclining}
                            confirmRaid={confirmRaid}
                            loggedInUser={loggedInUser}
                            currentCharacter={currentCharacter}
                            isCharMaxLevel={isCharMaxLevel}
                            CURRENT_MAX_LEVEL={CURRENT_MAX_LEVEL}
                            isConfirmed={isConfirmed}
                            isDeclined={isDeclined}
                        />
                    </CardBody>
                </div>
                <Tooltip content="Show raid members" className="bg-wood text-primary">
                    <Button
                        isDisabled={!raidRegistrations?.length}
                        onClick={onOpen}
                        isIconOnly className="bg-transparent text-primary absolute top-1 right-1 z-20">
                        <UsersIcon/>
                    </Button>
                </Tooltip>
            </Card>
            <Modal placement="center" isOpen={isOpen} size="xs" onOpenChange={onOpenChange} backdrop="blur">
                <ModalContent className="bg-wood pt-4">
                    {() => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h4 className="font-bold text-large text-gold">{raidName}</h4>
                                <small className="text-primary">{raidDate} - {raidTime}</small>
                                <small className="text-primary">Status:</small>
                            </ModalHeader>
                            <ModalBody>
                                {
                                    raidRegistrations?.map((registration: any) => {
                                        const {name, avatar} = registration.member?.character
                                        return (
                                            <div key={registration.raid_id + registration.member?.id}
                                                 className="flex flex-row justify-between items-center">
                                                <div className="flex flex-row items-center gap-2">
                                                    <Image
                                                        alt="User avatar"
                                                        className="w-8 h-8 rounded-full"
                                                        src={avatar}
                                                    />
                                                    <div className="flex flex-col">
                                                        <h5 className="text-gold font-bold">{name}</h5>
                                                    </div>
                                                </div>
                                                <div
                                                    className={`flex items-center ${registration.is_confirmed ? 'text-green-500' : 'text-red-500'}`}>
                                                    {registration.is_confirmed ? 'Confirmed' : 'Declined'}
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </ModalBody>
                            <ModalFooter className={'w-full relative'}>
                                <ConfirmDecline
                                    id={id}
                                    isConfirming={isConfirming}
                                    isDeclining={isDeclining}
                                    setIsConfirming={setIsConfirming}
                                    setIsDeclining={setIsDeclining}
                                    confirmRaid={confirmRaid}
                                    loggedInUser={loggedInUser}
                                    currentCharacter={currentCharacter}
                                    isCharMaxLevel={isCharMaxLevel}
                                    CURRENT_MAX_LEVEL={CURRENT_MAX_LEVEL}
                                    isConfirmed={isConfirmed}
                                    isDeclined={isDeclined}
                                />
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
        ;
}
