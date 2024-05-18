import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClock} from "@fortawesome/free-solid-svg-icons";
import {Button, Spinner} from "@nextui-org/react";
import {useAssistanceStore} from "@/app/raid/components/assistanceStore";
import {useState} from "react";
import {useSession} from "@/app/hooks/useSession";
import {assistRaid} from "@/app/raid/components/utils";
import useScreenSize from "@/app/hooks/useScreenSize";

export function LateAssistance({raidId}: { raidId: string }) {
    const [loading, setLoading] = useState(false)
    const selectedDays = useAssistanceStore(state => state.selectedDays)
    const {selectedCharacter} = useSession()
    const selectedRole = selectedCharacter?.selectedRole
    const {isMobile} = useScreenSize()

    return (
        <Button
            color={'warning'}
            className={`rounded ${isMobile ? 'w-full' : ''}`}
            disabled={loading || !selectedDays?.length}
            isDisabled={loading || !selectedDays?.length}
            onClick={() =>
                (async () => {
                    setLoading(true)
                    await assistRaid(raidId, selectedDays, selectedCharacter, selectedRole, 'late')
                    setLoading(false)
                })()
            }
            endContent={
                loading ? <Spinner size='sm' color='success'/> :
                    <FontAwesomeIcon icon={faClock}/>
            }
        >
            Late
        </Button>
    );
}
