'use client'
import moment from "moment";
import {useSession} from "@/app/hooks/useSession";
import {Button, Spinner, Tooltip} from "@nextui-org/react";
import {useAssistanceStore} from "@/app/raid/components/assistanceStore";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import {ConfirmAssistance} from "@/app/raid/components/ConfirmAssistance";
import {LateAssistance} from "@/app/raid/components/LateAssistance";
import {TentativeAssistance} from "@/app/raid/components/TentativeAssistance";
import DeclineAssistance from "@/app/raid/components/DeclineAssistance";
import {useEffect} from "react";
import NotLoggedInView from "@/app/components/NotLoggedInView";

const days = ['Wed', 'Thur', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue']

export const CheckIcon = ({className}: { className?: string }) => {
    return <FontAwesomeIcon icon={faCheck} className={className}/>
}

export default function AssistActions({raidId, minLvl, endDate, participants, hasLootReservations = false}: {
    raidId: string,
    minLvl: number,
    endDate: string,
    participants: any[]
    hasLootReservations?: boolean
}) {
    const {selectedCharacter, session, loading: isSessionLoading} = useSession()
    const selectedRole = selectedCharacter?.selectedRole
    const selectedDays = useAssistanceStore(state => state.selectedDays)
    const {addDay, removeDay} = useAssistanceStore(state => state)

    useEffect(() => {
        const currentParticipant = (participants ?? []).find((p: any) => p?.member?.character?.name === selectedCharacter?.name)
        if (currentParticipant && currentParticipant.details?.days) {
            (selectedDays ?? []).forEach((day: string) => removeDay(day));
            (currentParticipant?.details?.days ?? []).forEach((day: string) => addDay(day));
        }
    }, [selectedCharacter]);
    if (moment().isAfter(moment(endDate).endOf('day'))) {
        return <div className="text-red-500 flex items-center min-h-20">Raid has ended</div>
    }

    if (isSessionLoading) {
        return <Spinner/>
    }

    if (!selectedRole) {
        return <div className="text-red-500">Select a role first</div>
    }

    if (!session) {
        return <div className="text-red-500">You must be logged in to confirm</div>
    }

    if ((selectedCharacter?.level ?? 0) < minLvl) {
        return <div className="text-red-500">You must be at least level {minLvl} to assist</div>
    }

    return (
        <div className={
            'grid gap-2'
        }>
            <div className={'flex gap-2 flex-wrap'}>
                <Tooltip
                    content={`Select the days first`}
                    isDisabled={selectedDays?.length > 0}
                    placement={'right'}
                >
                    <div>
                        <ConfirmAssistance
                            hasLootReservations={hasLootReservations}
                            raidId={raidId}/>
                    </div>
                </Tooltip>
                <LateAssistance raidId={raidId}/>
                <TentativeAssistance raidId={raidId}/>
                <DeclineAssistance raidId={raidId}/>
            </div>
            <Tooltip
                content={
                    <div
                        className="animate-blink-and-glow border-gold border rounded-lg p-4"
                    >
                        <div>Select the days you can assist before continue</div>
                    </div>
                }
                showArrow
                placement={'top-end'}
                isOpen={selectedDays?.length === 0}
            >
                <div
                    className={
                        'grid gap-2 grid-cols-7'

                    }
                >
                    {days.map(day => {
                        return <Button
                            key={day}
                            className={
                                'bg-moss text-gold'
                                + ` ${selectedDays?.indexOf(day) !== -1 ? 'bg-gold text-moss' : ''}`
                            }
                            onClick={() => {
                                if (selectedDays?.indexOf(day) !== -1) {
                                    removeDay(day)
                                } else {
                                    addDay(day)
                                }
                            }}
                            endContent={
                                selectedDays?.indexOf(day) === -1 ? null : <CheckIcon/>
                            }
                        >{day}
                        </Button>
                    })}
                </div>
            </Tooltip>
        </div>
    )
}
