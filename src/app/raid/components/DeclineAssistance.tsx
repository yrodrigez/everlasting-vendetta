import {Button, Spinner} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBan} from "@fortawesome/free-solid-svg-icons";
import {useAssistanceStore} from "@/app/raid/components/assistanceStore";
import {useSession} from "@/app/hooks/useSession";
import {useState} from "react";
import {assistRaid} from "@/app/raid/components/utils";

export default function DeclineAssistance({raidId}: { raidId: string }) {
    const [loading, setLoading] = useState(false)
    const selectedDays = useAssistanceStore(state => state.selectedDays)
    const {selectedCharacter} = useSession()
    const selectedRole = selectedCharacter?.selectedRole


    return (
        <Button
            disabled={loading}
            isDisabled={loading}
            onClick={() =>
                (async () => {
                    setLoading(true)
                    await assistRaid(raidId, selectedDays, selectedCharacter, selectedRole, 'declined')
                    setLoading(false)
                })()
            }
            className={'bg-red-800 text-white'}
            endContent={
                loading ? <Spinner size='sm' color='success'/>:
                <FontAwesomeIcon icon={faBan}/>
            }
        >
            Decline
        </Button>
    )

}
