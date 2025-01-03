import {create as createStore} from 'zustand';
import {zustandLogger} from "@/app/util";
import type {Character} from "@/app/components/characterStore";
import type {SupabaseClient} from "@supabase/supabase-js";

export type SessionStore = {
    loading: boolean,
    bnetToken?: string,
    session?: Character,
    tokenUser?: Character & {permissions?: string[], custom_roles?: string[]},
    supabase?: SupabaseClient,
}

interface SessionStoreActions {
    setSession: (session: Character) => void,
    setSupabase: (supabase: SupabaseClient) => void,
    setBnetToken: (bnetToken: string) => void,
    setTokenUser: (tokenUser: Character) => void,
    setLoading: (loading: boolean) => void,
    clear: () => void,
}

const initialState: SessionStore = {
    loading: false,
}

export const useSessionStore = createStore<SessionStore & SessionStoreActions>()(zustandLogger<SessionStore & SessionStoreActions, SessionStore>((set) => ({
    ...initialState,
    setSession: (session: Character) => set({session}),
    setSupabase: (supabase: SupabaseClient) => set({supabase}),
    setBnetToken: (bnetToken: string) => set({bnetToken}),
    setTokenUser: (tokenUser: Character) => set({tokenUser}),
    setLoading: (loading: boolean) => set({loading}),
    clear: () => set(initialState),
})));
