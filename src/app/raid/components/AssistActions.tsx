'use client'
import moment from "moment";
import {useSession} from "@/app/hooks/useSession";
import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Spinner, Tooltip} from "@nextui-org/react";
import {useAssistanceStore} from "@/app/raid/components/assistanceStore";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowDown, faCheck, faPersonCircleQuestion, faPlus, faUserPlus} from "@fortawesome/free-solid-svg-icons";
import {ConfirmAssistance} from "@/app/raid/components/ConfirmAssistance";
import {LateAssistance} from "@/app/raid/components/LateAssistance";
import {TentativeAssistance} from "@/app/raid/components/TentativeAssistance";
import DeclineAssistance from "@/app/raid/components/DeclineAssistance";
import {useEffect} from "react";

import useScreenSize from "@/app/hooks/useScreenSize";
import {BnetLoginButton} from "@/app/components/BnetLoginButton";

export const WEEK_DAYS = {
    MONDAY: 'Mon',
    TUESDAY: 'Tue',
    WEDNESDAY: 'Wed',
    THURSDAY: 'Thu',
    FRIDAY: 'Fri',
    SATURDAY: 'Sat',
    SUNDAY: 'Sun',
}

export const CheckIcon = ({className}: { className?: string }) => {
    return <FontAwesomeIcon icon={faCheck} className={className}/>
}

export default function AssistActions({
                                          raidId,
                                          minLvl,
                                          endDate,
                                          participants,
                                          hasLootReservations = false,
                                          days = [WEEK_DAYS.WEDNESDAY, WEEK_DAYS.SATURDAY]
                                      }: {
    raidId: string,
    minLvl: number,
    endDate: string,
    participants: any[]
    hasLootReservations?: boolean
    days?: string[]
}) {
    const {selectedCharacter, session, loading: isSessionLoading} = useSession()
    const selectedRole = selectedCharacter?.selectedRole
    const {addDay, removeDay, selectedDays} = useAssistanceStore(state => state)

    useEffect(() => {
        const currentParticipant = (participants ?? []).find((p: any) => p?.member?.character?.name === selectedCharacter?.name)
        if (currentParticipant && currentParticipant.details?.days) {
            (selectedDays ?? []).forEach((day: string) => removeDay(day));
            (currentParticipant?.details?.days ?? []).forEach((day: string) => {
                if (days.indexOf(day) !== -1) addDay(day)
            });
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
                                <LateAssistance
                                    hasLootReservations={hasLootReservations}
                                    raidId={raidId}/>
                            </DropdownItem>
                            <DropdownItem>
                                <TentativeAssistance
                                    hasLootReservations={hasLootReservations}
                                    raidId={raidId}/>
                            </DropdownItem>
                            <DropdownItem>
                                <DeclineAssistance raidId={raidId}/>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                ) : <>
                    <LateAssistance
                        hasLootReservations={hasLootReservations}
                        raidId={raidId}/>
                    <TentativeAssistance
                        hasLootReservations={hasLootReservations}
                        raidId={raidId}/>
                    <DeclineAssistance raidId={raidId}/>
                </>}
            </div>

            <Tooltip
                className="animate-blink-and-glow border-gold border rounded-lg p-4"
                content={
                    <div className="flex flex-col items-center justify-center gap-2 text-2xl">
                        <div>Select the days you can assist before continue</div>
                        <FontAwesomeIcon icon={faArrowDown} bounce className="" />
                    </div>
                }

                placement={'top-start'}
                isOpen={selectedDays?.length === 0}
            >
                <div
                    className={
                        'grid gap-2 grid-cols-7 border-2 border-transparent rounded-lg p-1'
                        + ` ${selectedDays?.length === 0 ? ' border-red-500' : ''}`
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
