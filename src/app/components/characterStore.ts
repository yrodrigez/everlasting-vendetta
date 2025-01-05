import {create as createStore} from 'zustand'
import {persist} from 'zustand/middleware';

const storeKey = 'bnetProfile'
export type Role = 'tank' | 'healer' | 'dps' | 'tank-healer' | 'tank-dps' | 'healer-dps'

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
    setLastUpdated: (lastUpdated: number) => set({lastUpdated}),
    setSelectedCharacter: (character) => set({selectedCharacter: character}),
    setRole: (role: Role) => {
        const character = get().selectedCharacter
        if (!character) {
            return
        }

        set({selectedCharacter: {...character, selectedRole: role}})
    },
    setCharacters: (characters) => set({characters}),
    clear: () => set(initialState)
}), {name: storeKey}))
