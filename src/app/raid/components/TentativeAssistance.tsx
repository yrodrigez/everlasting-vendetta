import {useSession} from "@/app/hooks/useSession";
import {useAssistanceStore} from "@/app/raid/components/assistanceStore";
import React, {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faQuestion} from "@fortawesome/free-solid-svg-icons";
import {Button, Spinner} from "@nextui-org/react";
import {assistRaid} from "@/app/raid/components/utils";
import useScreenSize from "@/app/hooks/useScreenSize";

export function TentativeAssistance({raidId}: { raidId: string }) {
    const [loading, setLoading] = useState(false)
    const selectedDays = useAssistanceStore(state => state.selectedDays)
    const {selectedCharacter} = useSession()
    const selectedRole = selectedCharacter?.selectedRole
    const {isMobile} = useScreenSize()

    return (
        <Button
            color={'secondary'}
            className={`rounded ${isMobile ? 'w-full' : ''}`}
            disabled={loading || !selectedDays?.length}
            isDisabled={loading || !selectedDays?.length}
            onClick={() =>
                (async () => {
                    setLoading(true)
                    await assistRaid(raidId, selectedDays,selectedCharacter, selectedRole, 'tentative')
                    setLoading(false)
                })()
            }
            endContent={
                loading ? <Spinner size='sm' color='success'/> :
                    <FontAwesomeIcon icon={faQuestion}/>
            }
        >
            Tentative
        </Button>
    )
}
