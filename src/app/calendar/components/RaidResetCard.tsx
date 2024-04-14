'use client'
import moment, {Moment} from "moment";
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
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import RaidTimeInfo from "@/app/raid/components/RaidTimeInfo";
import {useRouter} from "next/navigation";



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

const Timer = ({timeToGo}: {
    timeToGo: Moment
}) => {

    const calculateAndSetTimeLeft = () => {
        const raidTime = timeToGo
        const currentTime = moment()

        return ({
            hours: raidTime.diff(currentTime, 'hours'),
            minutes: raidTime.diff(currentTime, 'minutes') % 60,
        })
    }
    const [timeLeft, setTimeLeft] = useState(calculateAndSetTimeLeft())

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(calculateAndSetTimeLeft())
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    return (
        <>
            {timeLeft.hours > 0 ? `${timeLeft.hours} hours and ${timeLeft.minutes} minutes` : `${timeLeft.minutes} minutes`} to
            go
        </>
    )

}

export function RaidResetCard({raidDate, raidName, raidImage, raidTime = '20:30', id, loggedInUser, minLevel}: {
    id: string,
    raidDate: string,
    raidName: string,
    raidImage: string,
    raidTime?: string,
    loggedInUser: any,
    minLevel: number
}) {
    const [isConfirming, setIsConfirming] = useState(false)
    const [raidRegistrations, setRaidRegistrations] = useState<any[]>([])
    const currentCharacter = useCharacterStore(state => state.selectedCharacter)
    const router = useRouter()

    useEffect(() => {
        fetchRaidMembers(id).then((data) => {
            setRaidRegistrations(data)
        })
    }, [id, currentCharacter])

    const database = createClientComponentClient()
    useEffect(() => {
        const raidParticipantChannel = database.channel(`raid_participants${id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'ev_raid_participant',
                filter: `raid_id=eq.${id}`
            }, async ({}) => {
                const data = await fetchRaidMembers(id)
                setRaidRegistrations(data)
            }).subscribe()
        return () => {
            database.removeChannel(raidParticipantChannel)
        }
    }, [id, currentCharacter, database]);


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
                    <small className="text-primary">{moment(raidDate).format('dddd, MMMM D')} - {raidTime}</small>
                    <RaidTimeInfo raidDate={raidDate} raidTime={raidTime}/>
                    <small className="text-primary">Confirmed: {raidRegistrations?.filter((member: any) => {
                        return member.is_confirmed
                    }).length}</small>
                    <small className="text-primary">Declined: {raidRegistrations?.filter((member: any) => {
                        return !member.is_confirmed
                    }).length}</small>
                    <CardBody className="absolute bottom-1 left-0">
                        <div className="flex flex-row justify-between w-full">
                            <Button
                                isIconOnly={isConfirming}
                                onClick={() => {
                                    router.push(`/raid/${id}`)
                                }}

                                className="w-full bg-moss hover:bg-moss-600 text-gold font-bold"
                            >
                                Open
                            </Button>
                        </div>
                    </CardBody>
                </div>
            </Card>
        </>
    );
}
