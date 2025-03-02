import {gearScoreFunctionUrl} from "@/app/lib/supa-functions/config";

export async function gearScore(name: string, force?: boolean): Promise<{
    gs: number | string,
    color: string,
    isFullEnchanted?: boolean
}> {
    const url = gearScoreFunctionUrl + (force ? `?force=${force}` : '')
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify([name])
    })

    if (!response.ok) {
        console.error('Error fetching gear score:', response.status, response.statusText)
        return {gs: 0, color: 'common'}
    }
    try {
        const data = await response.json()
        return data[0]
    } catch (e) {
        console.error('Error parsing gear score:', e)
        return {gs: 0, color: 'common'}
    }
}