'use client'
import {faHeart, faShield} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import moment from "moment";
import {useParticipants} from "@/app/raid/components/useParticipants";


const DpsIcon = ({className}: { className: string }) => <svg className={className}
                                                             xmlns="http://www.w3.org/2000/svg"
                                                             fill="currentColor"
                                                             viewBox="0 0 512 512">
    <path
        d="M400 16L166.6 249.4l96 96L496 112 512 0 400 16zM0 416l96 96 32-32-16-32 56-56 88 56 32-32L96 224 64 256l56 88L64 400 32 384 0 416z"/>
</svg>

export function KpisView({participants, raidId, raidInProgress}: {
    participants: any[],
    raidId: string,
    raidInProgress: boolean
}) {
    const [currentDay] = useState(['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'].find(day => moment().format('ddd') === day) ?? '')

    const rtParticipants = useParticipants(raidId, participants)

    function findRoleAndDay(_participant: any, role: string, day: string) {
        return _participant?.is_confirmed && _participant?.details?.role === role && _participant?.details?.days.find((d: string) => d.indexOf(day) >= 0)
    }

    function findConfirmedByRole(role: string, _participants: any[], day: string) {
        return _participants.reduce((acc, participant) => acc + +(participant?.is_confirmed && !!findRoleAndDay(participant, role, day)), 0)
    }

    function findConfirmedByDay(day: string, _participants: any[]) {
        return _participants.reduce((acc, participant) => acc + +(participant?.is_confirmed && !!participant?.details?.days.find((d: string) => d.indexOf(day) >= 0)), 0)
    }

    function findNotConfirmed(day: string, _participants: any[]) {
        return _participants.reduce((acc, participant) => acc + +(!participant?.is_confirmed), 0)
    }

    const [totalDps, setTotalDps] = useState(0)
    const [totalHealing, setTotalHealing] = useState(0)
    const [totalTanking, setTotalTanking] = useState(0)
    const [confirmed, setTotalConfirmed] = useState(0)
    const [declined, setDeclined] = useState(0)

    useEffect(() => {
        setTotalDps(findConfirmedByRole('dps', rtParticipants, currentDay))
        setTotalHealing(findConfirmedByRole('healer', rtParticipants, currentDay))
        setTotalTanking(findConfirmedByRole('tank', rtParticipants, currentDay))
        setTotalConfirmed(findConfirmedByDay(currentDay, rtParticipants))
        setDeclined(findNotConfirmed(currentDay, rtParticipants))
    }, [rtParticipants])

    return (
        <div className="flex flex-col gap-2 text-sm">

            <div className="flex flex-col">
                {raidInProgress && <span>Raiders for today:</span>}
                <div className="flex gap-2">
                    <span className="text-green-500">Confirmed: {confirmed}</span>
                    <span className="text-red-500">Declined: {declined}</span>
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
