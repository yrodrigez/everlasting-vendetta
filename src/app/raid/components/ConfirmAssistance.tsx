import {getRoleIcon} from "@/app/apply/components/utils";
import {Button, Spinner} from "@nextui-org/react";
import {useAssistanceStore} from "@/app/raid/components/assistanceStore";
import {useSession} from "@/app/hooks/useSession";
import {useState} from "react";
import {assistRaid} from "@/app/raid/components/utils";


export function ConfirmAssistance({raidId}: { raidId: string }) {
    const selectedDays = useAssistanceStore(state => state.selectedDays)
    const {selectedCharacter} = useSession()
    const selectedRole = selectedCharacter?.selectedRole
    const [loading, setLoading] = useState(false)
    return (
        <Button
            disabled={loading || !selectedDays?.length}
            isDisabled={loading || !selectedDays?.length}
            className={'bg-moss text-gold'}
            onClick={() => {
                (async () => {
                    setLoading(true)
                    await assistRaid(raidId, selectedDays,selectedCharacter, selectedRole, 'confirmed')
                    setLoading(false)
                })()
            }}
            endContent={loading ? <Spinner size='sm' color='success'/> : selectedRole &&
              <img className="w-6 h-6 rounded-full border border-gold"
                   src={getRoleIcon(selectedRole)} alt={selectedRole}/>}
        >Confirm as {selectedRole}
        </Button>
    )
}
