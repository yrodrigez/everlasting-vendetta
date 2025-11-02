import { create as createStore } from 'zustand'
import { persist } from 'zustand/middleware';
import { SELECTED_CHARACTER_COOKIE_KEY } from '../util/constants';
import { deleteCookie, setCookie, toB64Url } from '../util/auth/cookies-client';

export type SelectedCharacterCookieDTO = {
    id: number
    name: string
    level: number
    realmSlug: string
    role?: string
    guild?: {
        name?: string
        id?: number
    }
    class?: string
    avatar: string
}

function saveSelectedCharacterToCookie(character: Character | null) {
    if (!character) {
        deleteCookie(SELECTED_CHARACTER_COOKIE_KEY);
        return;
    }

    const toStore = toB64Url({
        id: character.id,
        name: character.name,
        level: character.level,
        realmSlug: character.realm.slug,
        role: character.selectedRole,
        guild: character.guild,
        class: character.playable_class?.name,
        avatar: character.avatar
    } as SelectedCharacterCookieDTO)
    setCookie(SELECTED_CHARACTER_COOKIE_KEY, toStore)
}

const storeKey = 'bnetProfile'
export type Role =
    'tank'
    | 'healer'
    | 'dps'
    | 'tank-healer'
    | 'tank-dps'
    | 'healer-dps'
    | 'rdps'
    | 'tank-rdps'
    | 'healer-rdps'

export interface Character {
    id: number
    name: string
    level: number
    avatar: string,
    realm: {
        slug: string
    },
    selectedRole?: Role
    playable_class?: {
        name?: string
    },
    isTemporal?: boolean
    isAdmin?: boolean
    guild?: {
        name?: string
        id?: number
    }
}

interface CharacterStore {
    characters: Character[]
    selectedCharacter: Character | null
    setSelectedCharacter: (character: Character) => void
    setCharacters: (characters: Character[]) => void
    lastUpdated: number
    setLastUpdated: (lastUpdated: number) => void,
    clear: () => void
    setRole: (role: Role) => void
}

const initialState = {
    characters: [],
    selectedCharacter: null,
    lastUpdated: 0,
    isTemporal: false,
    isAdmin: false
}

export const useCharacterStore = createStore<CharacterStore>()(persist((set, get) => ({
    ...initialState,
    setLastUpdated: (lastUpdated: number) => set({ lastUpdated }),
    setSelectedCharacter: (character) => {
        set({ selectedCharacter: character })
        if (!character) { deleteCookie(SELECTED_CHARACTER_COOKIE_KEY); return }
        const toStore = toB64Url(character)
        setCookie(SELECTED_CHARACTER_COOKIE_KEY, toStore)
        saveSelectedCharacterToCookie(character)
    },
    setRole: (role: Role) => {
        const character = get().selectedCharacter
        if (!character) {
            deleteCookie(SELECTED_CHARACTER_COOKIE_KEY);
            return
        }

        set({ selectedCharacter: { ...character, selectedRole: role } })
        saveSelectedCharacterToCookie({ ...character, selectedRole: role })
    },
    setCharacters: (characters) => set({ characters }),
    clear: () => set(initialState)
}), { name: storeKey }))
