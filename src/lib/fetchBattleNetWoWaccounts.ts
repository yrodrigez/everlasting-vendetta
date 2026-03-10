export async function fetchBattleNetWoWAccounts(token: string) {
    const url = 'https://eu.api.blizzard.com/profile/user/wow?namespace=profile-classic1x-eu&locale=en_US'
    const headers = new Headers()
    headers.append('Authorization', 'Bearer ' + token)
    try {
        const response = await fetch(url, {
            headers: headers
        });

        const data = await response.json();

        return (data.wow_accounts ?? []).reduce((acc: any[], wowAccount: any) => {
            return [...acc, ...(wowAccount?.characters ?? [])]
        }, [])
    } catch (e) {
        console.error('Error fetching wow accounts:', e)
        return []
    }
}
