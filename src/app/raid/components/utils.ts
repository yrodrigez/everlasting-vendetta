import {toast} from "sonner";

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
        toast.error(`Failed to assist raid ${error.error}`, {
            duration: 2500
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
