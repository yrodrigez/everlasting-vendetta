import { assistRaid } from "@/app/raid/components/utils";
import { useCharacterStore } from "@/components/characterStore";
import { sendActionEvent } from '@/hooks/usePageEvent';
import useScreenSize from '@/hooks/useScreenSize';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Spinner, Tooltip } from "@heroui/react";
import { useState } from "react";
import { useShallow } from "zustand/shallow";
import { getSubscriptionStatusText } from "./get-status-text";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

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
            className={`bg-wood text-ivory rounded flex-1 border border-wood-100`}
            endContent={
                loading ? <Spinner size='sm' color='success' /> :
                    <FontAwesomeIcon icon={faRightFromBracket} />
            }
        >
            {isMobile ? '' : getSubscriptionStatusText('declined')}
        </Button>
    )

}
