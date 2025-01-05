import {Button, Spinner} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBan} from "@fortawesome/free-solid-svg-icons";
import {useSession} from "@/app/hooks/useSession";
import {useState} from "react";
import {assistRaid} from "@/app/raid/components/utils";
import useScreenSize from "@/app/hooks/useScreenSize";

export default function DeclineAssistance({raidId}: { raidId: string }) {
    const [loading, setLoading] = useState(false)
    const {selectedCharacter} = useSession()
    const selectedRole = selectedCharacter?.selectedRole
    const {isMobile} = useScreenSize()


    return (
        <Button
            disabled={loading}
            isIconOnly={isMobile}
            isDisabled={loading}
            onPress={() =>
                (async () => {
                    setLoading(true)
                    await assistRaid(raidId, [], selectedCharacter, selectedRole, 'declined', true, () => {}) // TODO: change the logic here
                    setLoading(false)
                })()
            }
            className={`bg-red-800 text-white rounded flex-1`}
            endContent={
                loading ? <Spinner size='sm' color='success'/> :
                    <FontAwesomeIcon icon={faBan}/>
            }
        >
            {isMobile ? '' : 'Decline'}
        </Button>
    )

}
