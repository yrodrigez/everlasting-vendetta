import {useEffect} from "react";
import {useCharacterStore} from "@/app/components/characterStore";
import {useRouter, usePathname} from "next/navigation";
import {useSessionStore} from "@/app/hooks/useSessionStore";
import sessionManager from "@/app/hooks/SessionManager";
import {clearAllCookies} from "@/app/util";


export function useSession() {
    const {
        loading,
        setLoading,
        supabase,
        setSupabase,
        bnetToken,
        setBnetToken,
        tokenUser,
        setTokenUser,
        session,
        setSession,
        clear: clearSession
    } = useSessionStore(state => state);

    const selectedCharacter = useCharacterStore(state => state.selectedCharacter);
    const clearSelectedCharacter = useCharacterStore(state => state.clear);
    const router = useRouter();
    const pathName = usePathname();
    const clear = () => {
        clearSession();
        clearSelectedCharacter();
    };
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
