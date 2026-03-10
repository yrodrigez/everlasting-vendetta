'use client'
import { Button } from "@/components/Button";
import { useCharacterStore } from "@/components/characterStore";
import { useAuth } from "@/context/AuthContext";
import { useAssistanceStore } from "@/app/raid/components/assistanceStore";
import { ConfirmAssistance } from "@/app/raid/components/ConfirmAssistance";
import DeclineAssistance from "@/app/raid/components/DeclineAssistance";
import { LateAssistance } from "@/app/raid/components/LateAssistance";
import { TentativeAssistance } from "@/app/raid/components/TentativeAssistance";
import { RAID_STATUS } from "@/app/raid/components/utils";
import { useAuthManagerWindowStore } from "@/stores/auth-manager-window-store";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Accessibility, ArrowUpCircle, CalendarOff, CircleOff, Key, Lock, ShieldAlert } from "lucide-react";
import moment from "moment-timezone";
import React, { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

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
    status,
    realm
}: {
    raidId: string,
    minLvl: number,
    endDate: string,
    participants: any[]
    hasLootReservations?: boolean
    days?: string[]
    endTime: string
    status?: 'online' | 'offline' | 'locked'
    realm: string
}) {
    const { isAuthenticated } = useAuth();
    const selectedCharacter = useCharacterStore(useShallow(state => state.selectedCharacter));
    const selectedRole = useMemo(() => selectedCharacter?.selectedRole, [selectedCharacter])
    const setDays = useAssistanceStore(state => state.setDays)

    const openCharacterSelectionWindow = useAuthManagerWindowStore(state => state.onOpen);
    const { onOpen: openAuth } = useAuthManagerWindowStore()


    const [bounce, setBounce] = React.useState(false)

    useEffect(() => {
        setDays(days)
        setBounce(true)
        setTimeout(() => {
            setBounce(false)
        }, 2300)
    }, [selectedCharacter]);


    if (!isAuthenticated) {
        return <div className="text-red-500 flex flex-col mb-2">
            You must be logged in to participate
            <div className="mt-2">
                <Button onPress={openAuth} endContent={<Key size={16} />}>Login</Button>
            </div>
        </div>
    }

    if (status === 'offline') {
        return <div className="text-red-500 flex items-center min-h-7 gap-2"> <CircleOff size={16} /> Raid is Cancelled!</div>
    }

    if (moment.tz('Europe/Madrid').isAfter(moment(`${endDate} ${endTime === '00:00:00' ? '23:59:59' : endTime}`, 'YYYY-MM-DD HH:mm:ss').tz('Europe/Madrid'))) {
        return <div className="text-red-500 flex items-center min-h-7 gap-2">
            <CalendarOff size={16} /> Raid is over
        </div>
    }

    if (status === 'locked') {
        return <div className="text-yellow-500 flex items-center min-h-7 gap-2"> <Lock size={16} /> Raid is Locked</div>
    }

    if (selectedCharacter?.realm.slug !== (realm ?? 'living-flame')) {
        return <div className="text-red-500 flex items-center min-h-7 gap-2"><ShieldAlert size={16} />Selected character's realm does not match raid's realm. <Button size="sm" onPress={openCharacterSelectionWindow}>Change Character</Button></div>
    }

    if (!selectedRole) {
        return <div className="text-red-500 flex items-center min-h-7 gap-2">Select a role first</div>
    }

    if ((selectedCharacter?.level ?? 0) < minLvl) {
        return <div className="text-red-500 flex items-center gap-2">
            <ArrowUpCircle size={16} />
            You should be at level {minLvl} to participate
        </div>
    }

    if (participants.find(p => p.member.id === selectedCharacter?.id && p.details.status === RAID_STATUS.BENCH)) {
        return <div className="text-orange-400 flex gap-2">
            <Accessibility size={16} />
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
