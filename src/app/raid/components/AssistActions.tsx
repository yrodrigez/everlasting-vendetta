'use client'
import moment from "moment-timezone"


import { Spinner } from "@heroui/react";
import { useAssistanceStore } from "@/app/raid/components/assistanceStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChair, faCheck } from "@fortawesome/free-solid-svg-icons";
import { ConfirmAssistance } from "@/app/raid/components/ConfirmAssistance";
import { LateAssistance } from "@/app/raid/components/LateAssistance";
import { TentativeAssistance } from "@/app/raid/components/TentativeAssistance";
import DeclineAssistance from "@/app/raid/components/DeclineAssistance";
import React, { useEffect, useMemo } from "react";
import { BnetLoginButton } from "@/app/components/BnetLoginButton";
import { RAID_STATUS } from "@/app/raid/components/utils";
import { TemporalLogin } from "@/app/raid/components/TemporalLogin";
import { useAuth } from "@/app/context/AuthContext";
import { useShallow } from "zustand/react/shallow";
import { useCharacterStore } from "@/app/components/characterStore";

export const WEEK_DAYS = {
    MONDAY: 'Mon',
    TUESDAY: 'Tue',
    WEDNESDAY: 'Wed',
    THURSDAY: 'Thu',
    FRIDAY: 'Fri',
    SATURDAY: 'Sat',
    SUNDAY: 'Sun',
}



export const CheckIcon = ({ className }: { className?: string }) => {
    return <FontAwesomeIcon icon={faCheck} className={className} />
}

export default function AssistActions({
    raidId,
    minLvl,
    endDate,
    participants,
    hasLootReservations = false,
    endTime,
    days = [WEEK_DAYS.WEDNESDAY, WEEK_DAYS.SATURDAY],
    status
}: {
    raidId: string,
    minLvl: number,
    endDate: string,
    participants: any[]
    hasLootReservations?: boolean
    days?: string[]
    endTime: string
    status?: 'online' | 'offline'
}) {
    const { isAuthenticated } = useAuth();
    const selectedCharacter = useCharacterStore(useShallow(state => state.selectedCharacter));
    const selectedRole = useMemo(() => selectedCharacter?.selectedRole, [selectedCharacter])
    const setDays = useAssistanceStore(state => state.setDays)

    const [bounce, setBounce] = React.useState(false)

    useEffect(() => {
        setDays(days)
        setBounce(true)
        setTimeout(() => {
            setBounce(false)
        }, 2300)
    }, [selectedCharacter]);

    if (status === 'offline') {
        return <div className="text-red-500">Raid is Cancelled!</div>
    }

    if (moment.tz('Europe/Madrid').isAfter(moment(`${endDate} ${endTime === '00:00:00' ? '23:59:59' : endTime}`, 'YYYY-MM-DD HH:mm:ss').tz('Europe/Madrid'))) {
        return <div className="text-red-500 flex items-center min-h-7"></div>
    }

    if (!isAuthenticated) {
        return <div className="text-red-500 flex flex-col mb-2">
            Login to confirm
            <div
                className="flex gap-2 items-center justify-center"
            >
                <BnetLoginButton />
                <span className="text-default"> - or - </span>
                <TemporalLogin />
            </div>
        </div>
    }

    if (!selectedRole) {
        return <div className="text-red-500">Select a role first</div>

    }

    if ((selectedCharacter?.level ?? 0) < minLvl) {
        return <div className="text-red-500">You must be at least level {minLvl} to assist</div>
    }

    if (participants.find(p => p.member.id === selectedCharacter?.id && p.details.status === RAID_STATUS.BENCH)) {
        return <div className="text-orange-400 flex gap-2">
            <FontAwesomeIcon icon={faChair}
                bounce={bounce}
            />
            You are benched</div>
    }

    return (
        <div className={'grid gap-2'}>
            <div className={'flex gap-2 flex-wrap max-w-[500px]'}>
                <ConfirmAssistance
                    hasLootReservations={hasLootReservations}
                    raidId={raidId} />
                <LateAssistance
                    hasLootReservations={hasLootReservations}
                    raidId={raidId} />
                <TentativeAssistance
                    hasLootReservations={hasLootReservations}
                    raidId={raidId} />
                <DeclineAssistance raidId={raidId} />
            </div>
        </div>
    )
}
