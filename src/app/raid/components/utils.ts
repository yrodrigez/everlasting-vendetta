export async function assistRaid(raidId: string, selectedDays: any = [], selectedCharacter: any, selectedRole: any, status: string, hasLootReservations: boolean = false, onOpen: any) {
    await fetch('/api/v1/services/calendar/raid/assist', {
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

    if (!hasLootReservations) {
        onOpen()
        const noLootAudio = new Audio('/sounds/levelup2.ogg')
        noLootAudio.play().then(() => {
        }).catch((reason) => {
            console.error(reason)
        })
    }
}
