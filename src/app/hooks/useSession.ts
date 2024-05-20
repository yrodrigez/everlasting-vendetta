import { useEffect } from "react";
import { useCharacterStore } from "@/app/components/characterStore";
import { useRouter, usePathname } from "next/navigation";
import { useSessionStore } from "@/app/hooks/useSessionStore";
import sessionManager from "@/app/hooks/SessionManager";


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
    const router = useRouter();
    const pathName = usePathname();

    useEffect(() => {
        if(!selectedCharacter) {
            return setLoading(false);
        }
        sessionManager.initializeSession(
            selectedCharacter,
            router,
            pathName,
            clearSession,
            setSupabase,
            setSession,
            setTokenUser
        );
    }, [selectedCharacter, router, pathName, clearSession, setSupabase, setSession, setTokenUser]);

    return { session, selectedCharacter, supabase, bnetToken, loading, tokenUser };
}
