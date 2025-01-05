'use client'
import {
    faCheck,
    faCircleCheck, faCircleQuestion,
    faCircleXmark,
    faClock,
    faClose,
    faHeart,
    faShield
} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useMemo, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import moment from "moment";
import {useParticipants} from "@/app/raid/components/useParticipants";
import {type RaidParticipant} from "@/app/raid/api/types";
import {Tooltip} from "@nextui-org/react";


export const DpsIcon = ({className}: { className: string }) => <svg className={className}
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 512 512">
    <path
        d="M400 16L166.6 249.4l96 96L496 112 512 0 400 16zM0 416l96 96 32-32-16-32 56-56 88 56 32-32L96 224 64 256l56 88L64 400 32 384 0 416z"/>
</svg>

export function KpisView({participants, raidId, raidInProgress}: {
    participants: RaidParticipant[],
    raidId: string,
    raidInProgress: boolean
}) {
    const [currentDay] = useState(['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'].find(day => moment().format('ddd') === day) ?? '')

    const rtParticipants = useParticipants(raidId, participants)

    function findRoleAndDay(_participant: any, role: string, day: string) {
        return _participant?.is_confirmed && _participant?.details?.role.indexOf(role) !== -1
    }

    function findConfirmedByRole(role: string, _participants: RaidParticipant[], day: string) {
        return _participants.reduce((acc, participant) => acc + +(participant?.is_confirmed && !!findRoleAndDay(participant, role, day)), 0)
    }

    const [totalDps, setTotalDps] = useState(0)
    const [totalHealing, setTotalHealing] = useState(0)
    const [totalTanking, setTotalTanking] = useState(0)

    useEffect(() => {
        if (!rtParticipants) return
        setTotalDps(findConfirmedByRole('dps', rtParticipants, currentDay))
        setTotalHealing(findConfirmedByRole('healer', rtParticipants, currentDay))
        setTotalTanking(findConfirmedByRole('tank', rtParticipants, currentDay))
    }, [rtParticipants])

    const {confirmed, late, tentative, declined} = useMemo(() => {
        return rtParticipants.reduce((acc, participant) => {
            if (participant.details.status === 'confirmed') {
                acc.confirmed++
            } else if (participant.details.status === 'late') {
                acc.late++
            } else if (participant.details.status === 'tentative') {
                acc.tentative++
            } else if (participant.details.status === 'declined') {
                acc.declined++
            }
            return acc
        }, {confirmed: 0, late: 0, tentative: 0, declined: 0})
    }, [rtParticipants])

    return (
        <div className="flex flex-col gap-2 text-sm">
            <div className="flex flex-col">
                <div className="flex gap-3 transition-all duration-300 py-1 rounded-full w-fit">
                    <Tooltip content='Confirmed'>
                        <span className="text-success"><FontAwesomeIcon
                            icon={faCircleCheck}/> {confirmed}</span>
                    </Tooltip>
                    <Tooltip content='Late'>
                    <span className="text-warning"><FontAwesomeIcon
                        icon={faClock}/> {late}</span>
                    </Tooltip>
                    <Tooltip content='Tentative'>
                    <span className="text-relic"><FontAwesomeIcon
                        icon={faCircleQuestion}/> {tentative}</span>
                    </Tooltip>
                    <Tooltip content='Declined'>
                    <span className="text-danger"><FontAwesomeIcon
                        icon={faCircleXmark}/> {declined}</span>
                    </Tooltip>
                </div>
            </div>
            <div className="grid grid-cols-2 w-14">
                <FontAwesomeIcon icon={faShield}/>
                <span>{totalTanking}</span>

                <FontAwesomeIcon icon={faHeart}/>
                <span>{totalHealing}</span>

                <DpsIcon className="w-4 h-4"/>
                <span>{totalDps}</span>
            </div>
        </div>
    )
}
