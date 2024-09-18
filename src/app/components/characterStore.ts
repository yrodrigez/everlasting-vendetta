import {create as createStore} from 'zustand'
import {persist} from 'zustand/middleware';

const storeKey = 'bnetProfile'

export interface Character {
    id: number
    name: string
    level: number
    avatar: string,
    realm: {
        slug: string
    },
    selectedRole?: 'tank' | 'healer' | 'dps' | 'tank-healer' | 'tank-dps' | 'healer-dps' | undefined,
    playable_class?: {
        name?: string
    },

}

interface CharacterStore {
    characters: Character[]
    selectedCharacter: Character | null
    setSelectedCharacter: (character: Character) => void
    setCharacters: (characters: Character[]) => void
    lastUpdated: number
    setLastUpdated: (lastUpdated: number) => void,
    clear: () => void
}

const initialState = {
    characters: [],
    selectedCharacter: null,
    lastUpdated: 0,
}

export const useCharacterStore = createStore<CharacterStore>()(persist((set) => ({
    ...initialState,
    setLastUpdated: (lastUpdated: number) => set({lastUpdated}),
    setSelectedCharacter: (character) => set({selectedCharacter: character}),
    setCharacters: (characters) => set({characters}),
    clear: () => set(initialState)
}), {name: storeKey}))
