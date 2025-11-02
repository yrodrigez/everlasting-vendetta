import {create as createStore,} from 'zustand';
import {persist} from 'zustand/middleware';

export interface ApplyFormStore {
    name: string;
    email: string;
    message: string;
    characterClass: string;
    characterRole: string;
    realm: string;
    setName: (name: string) => void;
    setEmail: (email: string) => void;
    setMessage: (message: string) => void;
    setClass: (classType: string) => void;
    setRole: (role: string) => void;
    setRealm: (realm: string) => void;
    isFormDisabled: boolean;
    setIsFormDisabled: (isDisabled: boolean) => void;
    reset: () => void;
    characterExists: boolean;
    setCharacterExists: (exists: boolean) => void;
}

const logger = (config: any) => (set: any, get: any, api: any) => {
    if (process.env.NODE_ENV === 'production') {
        return config(set, get, api)
    }

    return config(
        (args: ApplyFormStore) => {
            console.log('  applying', args)
            set(args)
            console.log('  new state', get())
        },
        get,
        api
    )
}

const initialState = {
    name: '',
    email: '',
    message: '',
    characterClass: '',
    characterRole: '',
    isFormDisabled: true,
    characterExists: false,
}
const persistKey = 'apply-form'
export const useApplyFormStore = createStore<ApplyFormStore>()(logger(persist((set) => ({
    ...initialState,
    setName: (name: string) => set({name}),
    setEmail: (email: string) => set({email}),
    setMessage: (message: string) => set({message}),
    setClass: ((classType: string) => set({characterClass: classType})),
    setRole: ((role: string) => set({characterRole: role})),
    setIsFormDisabled: (isDisabled: string) => set({isFormDisabled: isDisabled}),
    setCharacterExists: (exists: boolean) => set({characterExists: exists}),
    setRealm: (realm: string) => set({realm}),
    reset: () => {
        localStorage.removeItem(persistKey)
        return set(initialState)
    }
}), {name: persistKey})));
