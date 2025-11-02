import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

export const RAID_STATUS = {
    CONFIRMED: 'confirmed',
    DECLINED: 'declined',
    TENTATIVE: 'tentative',
    LATE: 'late',
    BENCH: 'bench'
}

export async function assistRaid(raidId: string, selectedDays: any = [], selectedCharacter: any, selectedRole: any, status: string, hasLootReservations: boolean = false, onOpen: any) {
    const response = await fetch('/api/v1/services/calendar/raid/assist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: raidId,
            currentCharacter: selectedCharacter,
            details: {
                days: selectedDays,
                role: selectedRole,
                className: selectedCharacter?.playable_class?.name?.toLowerCase(),
                status: status
            }
        })
    })

    if (!response.ok) {
        const error = await response.json()

        toast.custom(() => (
            <div className="flex items-center bg-red-500 text-white p-4
            rounded-lg shadow-lg border border-red-600 shadow-red-500
            ">
                <div className="flex-shrink-0">
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                </div>
                <div className="ml-3">
                    <p className="text-sm font-medium ">{`Failed to assist raid: ${error.error}`}</p>
                </div>
            </div>
        ), {
            duration: 5000,
            position: 'top-center'
        })

        console.error('Error assisting raid', response)
        return
    }

    if (!hasLootReservations) {
        onOpen()
        const noLootAudio = new Audio('/sounds/levelup2.ogg')
        noLootAudio.play().then(() => {
        }).catch((reason) => {
            console.error(reason)
        })
    }
}
