import { useAssistanceStore } from "@/app/raid/components/assistanceStore";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import { Button, Spinner, useDisclosure } from "@heroui/react";
import { assistRaid } from "@/app/raid/components/utils";
import useScreenSize from "@/app/hooks/useScreenSize";
import { ShouldReserveModal } from "@/app/raid/components/ShouldReserveModal";
import { useCharacterStore } from "@/app/components/characterStore";
import { useShallow } from "zustand/shallow";

export function TentativeAssistance({ raidId, hasLootReservations = false }: {
    raidId: string,
    hasLootReservations: boolean
}) {
    const [loading, setLoading] = useState(false)
    const selectedDays = useAssistanceStore(state => state.selectedDays)
    const { selectedCharacter } = useCharacterStore(useShallow(state => ({ selectedCharacter: state.selectedCharacter })));
    const selectedRole = selectedCharacter?.selectedRole
    const { isMobile } = useScreenSize()
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()

    return (
        <>
            <Button
                color={'secondary'}
                isIconOnly={isMobile}
                className={`rounded flex-1`}
                disabled={loading || !selectedDays?.length}
                isDisabled={loading || !selectedDays?.length}
                onClick={() =>
                    (async () => {
                        setLoading(true)
                        await assistRaid(raidId, selectedDays, selectedCharacter, selectedRole, 'tentative', hasLootReservations, onOpen)
                        setLoading(false)
                    })()
                }
                endContent={
                    loading ? <Spinner size='sm' color='success' /> :
                        <FontAwesomeIcon icon={faQuestion} />
                }
            >
                {isMobile ? '' : 'Tentative'}
            </Button>
            <ShouldReserveModal raidId={raidId} isOpen={isOpen} onClose={onClose} onOpenChange={onOpenChange} />
        </>

    )
}
