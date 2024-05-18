'use client'
import moment from "moment";
import {useSession} from "@/app/hooks/useSession";
import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Spinner, Tooltip} from "@nextui-org/react";
import {useAssistanceStore} from "@/app/raid/components/assistanceStore";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faPersonCircleQuestion, faPlus, faUserPlus} from "@fortawesome/free-solid-svg-icons";
import {ConfirmAssistance} from "@/app/raid/components/ConfirmAssistance";
import {LateAssistance} from "@/app/raid/components/LateAssistance";
import {TentativeAssistance} from "@/app/raid/components/TentativeAssistance";
import DeclineAssistance from "@/app/raid/components/DeclineAssistance";
import {useEffect} from "react";
import NotLoggedInView from "@/app/components/NotLoggedInView";
import useScreenSize from "@/app/hooks/useScreenSize";
import {BnetLoginButton} from "@/app/components/BnetLoginButton";

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

    const {isMobile} = useScreenSize()

    if (moment().isAfter(moment(endDate).endOf('day'))) {
        return <div className="text-red-500 flex items-center min-h-20">Raid has ended</div>
    }

    if (isSessionLoading) {
        return <Spinner/>
    }

    if (!session) {
        return <div className="text-red-500 flex flex-col">Login to confirm your assistance
            <BnetLoginButton/>
        </div>
    }

    if (!selectedRole) {
        return <div className="text-red-500">Select a role first</div>

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
                {isMobile ? (
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                isIconOnly
                                className={'bg-wood text-default rounded border border-default/30'}
                            >
                                <FontAwesomeIcon icon={faPersonCircleQuestion}/>
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                            <DropdownItem>
                                <LateAssistance raidId={raidId}/>
                            </DropdownItem>
                            <DropdownItem>
                                <TentativeAssistance raidId={raidId}/>
                            </DropdownItem>
                            <DropdownItem>
                                <DeclineAssistance raidId={raidId}/>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                ) : <>
                    <LateAssistance raidId={raidId}/>
                    <TentativeAssistance raidId={raidId}/>
                    <DeclineAssistance raidId={raidId}/>
                </>}
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
                            isIconOnly={isMobile}
                            className={
                                'bg-red-400/80 text-red-800 rounded-full border border-red-900'
                                + ` ${selectedDays?.indexOf(day) !== -1 ? 'bg-green-500/80 text-green-900 border-green-900' : ''}`
                            }
                            onClick={() => {
                                if (selectedDays?.indexOf(day) !== -1) {
                                    removeDay(day)
                                } else {
                                    addDay(day)
                                }
                            }}
                            endContent={
                                isMobile || selectedDays?.indexOf(day) === -1 ? null : <CheckIcon/>
                            }
                        >{day}
                        </Button>
                    })}
                </div>
            </Tooltip>
        </div>
    )
}
