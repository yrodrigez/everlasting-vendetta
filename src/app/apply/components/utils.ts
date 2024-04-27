import {ApplyFormStore} from "@/app/apply/components/store";

export const healingClasses = ['priest', 'paladin', 'shaman', 'druid', 'mage']
export const tankClasses = ['warrior', 'paladin', 'druid', 'rogue', 'warlock']
export const dpsClasses = ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock']

export type ApplyFormValues = {
    name: string,
    email?: string,
    characterRole: string,
    characterClass: string,
    message: string
}

export function validateCharactersName(name: string) {
    // Check if the name meets the required length
    if (name.length < 2 || name.length > 12) {
        return false;
    }

    // Check if the name starts with a letter and contains only letters
    if (!/^[A-Za-z]+$/.test(name)) {
        return false;
    }

    // Verify that it doesn't have more than 4 consecutive consonants or 3 consecutive vowels
    return !/[^aeiouAEIOU]{5,}|[aeiouAEIOU]{4,}/.test(name);
}

export function validateStore(store: ApplyFormValues) {
    const role = store.characterRole.toLowerCase()
    const characterClass = store.characterClass.toLowerCase()
    if (role === 'healer' && !healingClasses.includes(characterClass)) {
        return {error: 'Invalid class for healer role'}
    }
    if (role === 'tank' && !tankClasses.includes(characterClass)) {
        return {error: 'Invalid class for tank role'}
    }
    if (role === 'dps' && !dpsClasses.includes(characterClass)) {
        return {error: 'Invalid class for dps role'}
    }
    if (!validateCharactersName(store.name)) {
        return {error: 'Invalid character name'}
    }
    return {error: null}
}

export async function onForm(state: ApplyFormValues) {
    if (!state) return

    const validation = validateStore(state)
    if (validation.error) {
        return validation
    }

    const response = await fetch('/api/v1/services/form/apply', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(state)
    })

    if (!response.ok) {
        const data = await response.json()
        return {error: data.error}
    }

    return {error: null}
}

export function getClassIcon(classname: string) {

    return `/classicon/classicon_${classname.toLowerCase()}.jpg`;
}

export function getRoleIcon(role: string) {
    return {
        'tank': '/role-icons/tank.png',
        'off-tank': '/role-icons/tank.png',
        'healer': '/role-icons/healer.png',
        'dps': '/role-icons/dps.png',
    }[role.toLowerCase()] || '';
}
