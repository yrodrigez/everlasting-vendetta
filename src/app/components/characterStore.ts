import {create as createStore} from 'zustand'
import {persist} from 'zustand/middleware';

const storeKey = 'bnetProfile'

interface Character {
    id: number
    name: string
    level: number
    avatar: string,
    realm: {
        slug: string
    }
}

interface CharacterStore {
    characters: Character[]
    selectedCharacter: Character | null
    setSelectedCharacter: (character: Character) => void
    setCharacters: (characters: Character[]) => void
}

const initialState = {
    characters: [],
    selectedCharacter: null
}

export const useCharacterStore = createStore<CharacterStore>()(persist((set) => ({
    characters: [],
    selectedCharacter: null,
    setSelectedCharacter: (character) => set({selectedCharacter: character}),
    setCharacters: (characters) => set({characters})
}), {name: storeKey}))
