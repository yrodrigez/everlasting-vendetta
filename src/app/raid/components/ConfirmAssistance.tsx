import {getRoleIcon} from "@/app/apply/components/utils";
import {
    Button,
    Spinner,
    useDisclosure
} from "@nextui-org/react";
import {useAssistanceStore} from "@/app/raid/components/assistanceStore";
import {useSession} from "@/app/hooks/useSession";
import {useState} from "react";
import {assistRaid} from "@/app/raid/components/utils";

import {ShouldReserveModal} from "@/app/raid/components/ShouldReserveModal";


export function ConfirmAssistance({raidId, hasLootReservations = false}: {
    raidId: string,
    hasLootReservations?: boolean
}) {
    const selectedDays = useAssistanceStore(state => state.selectedDays)
    const {selectedCharacter} = useSession()
    const selectedRole = selectedCharacter?.selectedRole
    const [loading, setLoading] = useState(false)
    const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure()

    return (
        <>
            <Button
                disabled={loading || !selectedDays?.length}
                isDisabled={loading || !selectedDays?.length}
                className={'bg-moss text-gold rounded border border-gold/50'}
                onClick={() => {
                    (async () => {
                        setLoading(true)
                        await assistRaid(raidId, selectedDays, selectedCharacter, selectedRole, 'confirmed', hasLootReservations, onOpen)
                        setLoading(false)
                    })()
                }}
                endContent={loading ? <Spinner size='sm' color='success'/> : selectedRole &&
                  <img className="w-6 h-6 rounded-full"
                       src={getRoleIcon(selectedRole)} alt={selectedRole}/>}
            >Confirm as {selectedRole}
            </Button>
            <ShouldReserveModal
                raidId={raidId}
                isOpen={isOpen}
                onClose={onClose}
                onOpenChange={onOpenChange}
            />
        </>
    )
}
