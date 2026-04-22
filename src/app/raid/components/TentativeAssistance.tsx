import { ShouldReserveModal } from "@/app/raid/components/ShouldReserveModal";
import { assistRaid } from "@/app/raid/components/utils";
import { useCharacterStore } from "@/components/characterStore";
import { sendActionEvent } from '@/hooks/usePageEvent';
import useScreenSize from '@/hooks/useScreenSize';
import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Spinner, useDisclosure } from "@heroui/react";
import { useState } from "react";
import { useShallow } from "zustand/shallow";

export function TentativeAssistance({ raidId, hasLootReservations = false }: {
    raidId: string,
    hasLootReservations: boolean
}) {
    const [loading, setLoading] = useState(false)
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
                disabled={loading}
                isDisabled={loading}
                onPress={() =>
                    (async () => {
                        setLoading(true)
                        sendActionEvent('raid_tentative', { raidId, characterName: selectedCharacter?.name });
                        await assistRaid(raidId, selectedCharacter, selectedRole, 'tentative', hasLootReservations, onOpen)
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
