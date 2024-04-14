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

const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat']

export const CheckIcon = ({className}: { className?: string }) => {
    return <FontAwesomeIcon icon={faCheck} className={className}/>
}

export default function AssistActions({raidId, minLvl, endDate}: { raidId: string, minLvl: number, endDate: string }) {
    const {selectedCharacter, session, loading: isSessionLoading, bnetToken} = useSession()
    const selectedRole = selectedCharacter?.selectedRole
    const selectedDays = useAssistanceStore(state => state.selectedDays)
    const {addDay, removeDay} = useAssistanceStore(state => state)

    if (moment().isAfter(moment(endDate))) {
        return <div className="text-red-500">Raid has ended</div>
    }

    if (isSessionLoading) {
        return <Spinner/>
    }

    if (!selectedRole) {
        return <div className="text-red-500">Select a role first</div>
    }

    if (!session) {
        return <div className="text-red-500">You must be logged in to assist</div>
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
                        <ConfirmAssistance raidId={raidId}/>
                    </div>
                </Tooltip>
                <LateAssistance raidId={raidId}/>
                <TentativeAssistance raidId={raidId}/>
                <DeclineAssistance raidId={raidId}/>
            </div>
            <div>
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
        </div>
    )
}
