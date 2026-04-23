import { useEffect, useState } from "react";

type UseScrollToRaidParticipantProps = {
    participantId?: number | null;
    isParticipantPresent: boolean;
    duration?: number;
    activationTimeout?: number;
    safeDeactivationInterval?: number;
}

export function useScrollToRaidParticipant({ participantId, isParticipantPresent, duration = 1500, activationTimeout = 500, }: UseScrollToRaidParticipantProps) {
    const [focusedParticipantId, setFocusedParticipantId] = useState<number | null>(null)

    useEffect(() => {
        if (!participantId || !isParticipantPresent) {
            setFocusedParticipantId(null)
            return
        }

        const activationId = window.setTimeout(() => {
            const participantRow = document.getElementById(`participant-${participantId}`)
            if (participantRow) {
                participantRow.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
            setFocusedParticipantId(participantId)
        }, activationTimeout)

        return () => {
            window.clearTimeout(activationId)
        }
    }, [participantId, isParticipantPresent, activationTimeout])

    useEffect(() => {
        if (focusedParticipantId === null) {
            return
        }

        const deactivationId = window.setTimeout(() => {
            setFocusedParticipantId(null)
        }, duration)

        return () => {
            window.clearTimeout(deactivationId)
        }
    }, [focusedParticipantId, duration])

    return {
        focusedParticipantId,
        isFocusActive: focusedParticipantId !== null && focusedParticipantId === participantId,
    }
}
