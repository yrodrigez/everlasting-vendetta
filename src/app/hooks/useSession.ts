'use client'
import {useEffect, useState} from "react";
import {useCharacterStore} from "@/app/components/characterStore";
import {createClientComponentClient, SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {getCookie, getLoggedInUserFromAccessToken, logout} from "@/app/util";
import {toast} from "sonner";

async function installSession(token: string, selectedCharacter: any, retries: number = 0) {
    const response = await fetch('/api/v1/supabase/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({character: selectedCharacter, token})
    })

    if (response.status === 302) { // Redirect to Bnet auth
        return window.location.replace(response.headers.get('Location')!)
    }

    if (response.status === 401) {
        return window.location.replace('/api/v1/oauth/bnet/auth')
    }

    if (!response.ok) {
        if (retries > 3) {
            toast.error('Failed to install session', {
                duration: 2500,
                onDismiss: logout,
                onAutoClose: logout,
            })
            console.error('Failed to install session - response not ok')
            return {error: 'Failed to install session'}
        }
        return installSession(token, selectedCharacter, retries + 1)
    }

    try {
        return await response.json()
    } catch (e) {
        if (retries > 3) {
            toast.error('Failed to install session', {
                duration: 2500,
                onDismiss: logout,
                onAutoClose: logout,
            })
            console.error('Failed to install session - error while parsing response')
            return {error: 'Failed to install session'}
        }
        return installSession(token, selectedCharacter, retries + 1)
    }
}

const createClient = (token: string) => createClientComponentClient({
    options: {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    }
})

export function useSession() {
    const [session, setSession] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [supabase, setSupabase] = useState<SupabaseClient>()
    const selectedCharacter = useCharacterStore(state => state.selectedCharacter)
    const [bnetToken, setBnetToken] = useState<string | undefined>(undefined)
    const [tokenUser, setTokenUser] = useState<any>(null)

    useEffect(() => {
        setSupabase(undefined)
        const bnetToken = getCookie('bnetToken')
        if (!bnetToken || !selectedCharacter) {
            setBnetToken(undefined)
            setSession(null)

            return setLoading(false)
        }
        setBnetToken(bnetToken);

        const access_token = getCookie('evToken')
        if (access_token) {
            const currentCookieCharacter = getLoggedInUserFromAccessToken(access_token)
            if (currentCookieCharacter?.id === selectedCharacter.id) { // If the selected character is the same as the one in the cookie, we can use the current session
                const newSupabaseClient = createClient(access_token)
                setSupabase(() => newSupabaseClient);
                setSession(() => getLoggedInUserFromAccessToken(access_token));
                setTokenUser(currentCookieCharacter)
                return setLoading(false)
            }
        }

        (async () => {
            setLoading(true)
            const {access_token} = await installSession(bnetToken, selectedCharacter)
            if (!access_token) {
                return setLoading(false)
            }

            const newSupabaseClient = createClient(access_token)
            setSupabase(() => newSupabaseClient);
            setSession(() => getLoggedInUserFromAccessToken(access_token));
            setTokenUser(getLoggedInUserFromAccessToken(access_token) ?? null)
            setLoading(false)
        })()
    }, [selectedCharacter])

    return {session, selectedCharacter, supabase, bnetToken, loading, tokenUser}
}
