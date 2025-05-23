import {useCallback, useEffect} from "react";
import {useCharacterStore} from "@/app/components/characterStore";
import {usePathname, useRouter} from "next/navigation";
import {useSessionStore} from "@/app/hooks/useSessionStore";
import sessionManager from "@/app/hooks/SessionManager";
import {useShallow} from "zustand/react/shallow";

export function useSession() {
    const {
        loading,
        setLoading,
        supabase,
        setSupabase,
        bnetToken,
        tokenUser,
        setTokenUser,
        session,
        setSession,
        clear: clearSession
    } = useSessionStore(useShallow(state => ({
        loading: state.loading,
        setLoading: state.setLoading,
        supabase: state.supabase,
        setSupabase: state.setSupabase,
        bnetToken: state.bnetToken,
        tokenUser: state.tokenUser,
        setTokenUser: state.setTokenUser,
        session: state.session,
        setSession: state.setSession,
        clear: state.clear
    })));

    const selectedCharacter = useCharacterStore(state => state.selectedCharacter);
    const clearSelectedCharacter = useCharacterStore(state => state.clear);
    const router = useRouter();
    const pathName = usePathname();
    const clear = useCallback(() => {
        clearSession();
        clearSelectedCharacter();
    }, [clearSession, clearSelectedCharacter]);
    useEffect(() => {
        if (!selectedCharacter) {
            return setLoading(false);
        }
        sessionManager.initializeSession(
            selectedCharacter,
            router,
            pathName,
            clear,
            setSupabase,
            setSession,
            setTokenUser
        );
    }, [selectedCharacter, router, pathName, clearSession, setSupabase, setSession, setTokenUser]);

    return {session, selectedCharacter, supabase, bnetToken, loading, tokenUser};
}
