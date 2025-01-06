'use client'
import {RaidParticipant} from "@/app/raid/api/types";
import {useParticipants} from "@/app/raid/components/useParticipants";

export default function ParticipantsManager({resetId, initialParticipants, children}: {
    resetId: string, initialParticipants: RaidParticipant[],
    children: React.ReactNode
}) {

    useParticipants(resetId, initialParticipants)

    return children
}
