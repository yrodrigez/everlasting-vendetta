import { useEffect, useRef, useState } from "react";

type UseScrollToRaidParticipantProps = {
    participantId?: number | null;
    isParticipantPresent: boolean;
    duration?: number;
    activationTimeout?: number;
}

export function useScrollToRaidParticipant({ participantId, isParticipantPresent, duration = 1500, activationTimeout = 500 }: UseScrollToRaidParticipantProps) {
    const [focusedParticipantId, setFocusedParticipantId] = useState<number | null>(null)
    const timeoutRef = useRef<number | null>(null)
    const activationTimeoutRef = useRef<number | null>(null)

    useEffect(() => {
        return () => {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current)
            }
            if (activationTimeoutRef.current !== null) {
                window.clearTimeout(activationTimeoutRef.current)
            }
        }
    }, [])

    useEffect(() => {
        if (!participantId || !isParticipantPresent) {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current)
                timeoutRef.current = null
            }

            if (activationTimeoutRef.current !== null) {
                window.clearTimeout(activationTimeoutRef.current)
                activationTimeoutRef.current = null
            }

            setFocusedParticipantId(null)
            return
        }

        activationTimeoutRef.current = window.setTimeout(() => {
            const participantRow = document.getElementById(`participant-${participantId}`)
            if (!participantRow) {
                return
            }

            participantRow.scrollIntoView({ behavior: 'smooth', block: 'center' })
            setFocusedParticipantId(participantId)

            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current)
            }

            timeoutRef.current = window.setTimeout(() => {
                setFocusedParticipantId((currentParticipantId) => currentParticipantId === participantId ? null : currentParticipantId)
                timeoutRef.current = null
            }, duration)
        }, activationTimeout)
    }, [duration, participantId, isParticipantPresent])

    return {
        focusedParticipantId,
        isFocusActive: focusedParticipantId === participantId,
    }
}
