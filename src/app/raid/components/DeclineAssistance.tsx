import { assistRaid } from "@/app/raid/components/utils";
import { useCharacterStore } from "@/components/characterStore";
import { sendActionEvent } from '@/hooks/usePageEvent';
import useScreenSize from '@/hooks/useScreenSize';
import { faBan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Spinner } from "@heroui/react";
import { useState } from "react";
import { useShallow } from "zustand/shallow";

export default function DeclineAssistance({ raidId }: { raidId: string }) {
    const [loading, setLoading] = useState(false)
    const selectedCharacter = useCharacterStore(useShallow(state => state.selectedCharacter)); const selectedRole = selectedCharacter?.selectedRole
    const { isMobile } = useScreenSize()


    return (
        <Button
            disabled={loading}
            isIconOnly={isMobile}
            isDisabled={loading}
            onPress={() =>
                (async () => {
                    setLoading(true)
                    sendActionEvent('raid_decline', { raidId, characterName: selectedCharacter?.name });
                    await assistRaid(raidId, [], selectedCharacter, selectedRole, 'declined', true, () => { }) // TODO: change the logic here
                    setLoading(false)
                })()
            }
            className={`bg-red-800 text-white rounded flex-1`}
            endContent={
                loading ? <Spinner size='sm' color='success' /> :
                    <FontAwesomeIcon icon={faBan} />
            }
        >
            {isMobile ? '' : 'Decline'}
        </Button>
    )

}
