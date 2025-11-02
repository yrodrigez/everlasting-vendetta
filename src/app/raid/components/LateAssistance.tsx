import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { Button, Spinner, useDisclosure } from "@heroui/react";
import { useAssistanceStore } from "@/app/raid/components/assistanceStore";
import { useState } from "react";
import { assistRaid } from "@/app/raid/components/utils";
import useScreenSize from "@/app/hooks/useScreenSize";
import { ShouldReserveModal } from "@/app/raid/components/ShouldReserveModal";
import { useCharacterStore } from "@/app/components/characterStore";
import { useShallow } from "zustand/shallow";

export function LateAssistance({ raidId, hasLootReservations }: { raidId: string, hasLootReservations: boolean }) {
    const [loading, setLoading] = useState(false)
    const selectedDays = useAssistanceStore(state => state.selectedDays)
    const { selectedCharacter } = useCharacterStore(useShallow(state => ({ selectedCharacter: state.selectedCharacter })));
    const selectedRole = selectedCharacter?.selectedRole
    const { isMobile } = useScreenSize()
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()

    return (
        <>
            <Button
                color={'warning'}
                isIconOnly={isMobile}
                className={`rounded flex-1`}
                disabled={loading || !selectedDays?.length}
                isDisabled={loading || !selectedDays?.length}
                onClick={() =>
                    (async () => {
                        setLoading(true)
                        await assistRaid(raidId, selectedDays, selectedCharacter, selectedRole, 'late', hasLootReservations, onOpen)
                        setLoading(false)
                    })()
                }
                endContent={
                    loading ? <Spinner size='sm' color='success' /> :
                        <FontAwesomeIcon icon={faClock} />
                }
            >
                {isMobile ? '' : 'Late'}
            </Button>
            <ShouldReserveModal
                raidId={raidId}
                isOpen={isOpen}
                onClose={onClose}
                onOpenChange={onOpenChange}
            />
        </>
    );
}
