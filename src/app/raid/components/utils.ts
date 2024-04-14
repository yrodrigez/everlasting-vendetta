export async function assistRaid(raidId: string, selectedDays: any = [], selectedCharacter: any, selectedRole: any, status: string) {
    return fetch('/api/v1/services/calendar/raid/assist', {
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

}
