'use client'
import {useEffect, useState} from "react";
import {useCharacterStore} from "@/app/components/characterStore";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {getCookie, getLoggedInUserFromAccessToken} from "@/app/util";

async function installSession(token: string, selectedCharacter: any) {
    const response = await fetch('/api/v1/supabase/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({character: selectedCharacter, token})
    })

    return await response.json()
}

export function useSession() {
    const [session, setSession] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [supabase, setSupabase] = useState<any>()
    const selectedCharacter = useCharacterStore(state => state.selectedCharacter)
    const [bnetToken, setBnetToken] = useState<string | undefined>(undefined)

    useEffect(() => {
        setSupabase(undefined)
        const bnetToken = getCookie('bnetToken')
        if (!bnetToken || !selectedCharacter) {
            setBnetToken(undefined)
            setSession(null)

            return setLoading(false)
        }

        setBnetToken(bnetToken);
        (async () => {
            setLoading(true)
            const {access_token} = await installSession(bnetToken, selectedCharacter)
            if (!access_token) return setLoading(false)

            const newSupabaseClient = createClientComponentClient({
                options: {
                    global: {
                        headers: {
                            Authorization: `Bearer ${access_token}`
                        }
                    }
                }
            })
            setSupabase(() => newSupabaseClient);
            setSession(() => getLoggedInUserFromAccessToken(access_token));
            setLoading(false)
        })()
    }, [selectedCharacter, bnetToken])

    return {session, selectedCharacter, supabase, bnetToken, loading}
}
