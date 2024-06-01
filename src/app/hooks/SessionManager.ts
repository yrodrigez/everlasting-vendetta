// sessionManager.ts
import {createClientComponentClient, SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {getCookie, getLoggedInUserFromAccessToken, logout} from "@/app/util";
import {toast} from "sonner";
import {BNET_COOKIE_NAME, EV_COOKIE_NAME, LOGIN_URL} from "@/app/util/constants";
import {Character} from "@/app/components/characterStore";


class SessionManager {
    loading: boolean = false;
    supabase: SupabaseClient | undefined = undefined;
    bnetToken: string | undefined = undefined;
    tokenUser: Character | undefined = undefined;
    session: Character | undefined = undefined;
    isInstallingSession: boolean = false;

    async installSession(token: string | undefined, selectedCharacter: Character, retries: number = 0): Promise<{
        access_token?: string,
        error?: string
    }> {

        const maxRetries = 3;

        try {
            const response = await fetch('/api/v1/supabase/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({character: selectedCharacter, token})
            });

            if (response.status === 302) {
                window.location.replace(response.headers.get('Location')!);
                return {};
            }

            if (response.status === 401) {
                window.location.replace('/api/v1/oauth/bnet/auth');
                return {};
            }

            if (!response.ok) {
                if (retries >= maxRetries) {
                    throw new Error('Failed to install session after multiple retries');
                }
                return this.installSession(token, selectedCharacter, retries + 1);
            }

            return await response.json();
        } catch (e) {
            if (retries >= maxRetries) {
                toast.error('Failed to install session', {
                    duration: 2500,
                    onDismiss: logout,
                    onAutoClose: logout,
                });
                console.error('Failed to install session:', e);
                return {error: 'Failed to install session'};
            }
            return this.installSession(token, selectedCharacter, retries + 1);
        }
    }

    async initializeSession(
        selectedCharacter: Character,
        router: any,
        pathName: string,
        clearSession: () => void,
        setSupabase: (client: SupabaseClient) => void,
        setSession: (user: Character) => void,
        setTokenUser: (user: Character) => void
    ): Promise<void> {
        if (!selectedCharacter?.id || this.loading || this.isInstallingSession) return;

        this.loading = true;

        try {
            const bnetToken = getCookie(BNET_COOKIE_NAME);
            const access_token = getCookie(EV_COOKIE_NAME);

            if (!bnetToken && !access_token) {
                router.replace(`${LOGIN_URL}?redirectedFrom=${pathName}`);
                return;
            }

            this.bnetToken = bnetToken;

            if (access_token) {
                const currentCookieCharacter = getLoggedInUserFromAccessToken(access_token);
                if (currentCookieCharacter?.id === selectedCharacter.id) {
                    this.supabase = createClientComponentClient({
                        options: {
                            global: {
                                headers: {
                                    Authorization: `Bearer ${access_token}`
                                }
                            }
                        }
                    });
                    this.session = getLoggedInUserFromAccessToken(access_token);
                    this.tokenUser = currentCookieCharacter;
                    setSupabase(this.supabase);
                    if (this.session && this.tokenUser) {
                        setSession(this.session);
                        setTokenUser(this.tokenUser);
                    }
                    return;
                }
            }

            this.isInstallingSession = true;
            const {access_token: newAccessToken} = await this.installSession(bnetToken, selectedCharacter);
            if (newAccessToken) {
                this.supabase = createClientComponentClient({
                    options: {
                        global: {
                            headers: {
                                Authorization: `Bearer ${newAccessToken}`
                            }
                        }
                    }
                });
                this.session = getLoggedInUserFromAccessToken(newAccessToken);
                this.tokenUser = getLoggedInUserFromAccessToken(newAccessToken);
                setSupabase(this.supabase);
                if (this.session && this.tokenUser) {
                    setSession(this.session);
                    setTokenUser(this.tokenUser);
                }
            }
        } catch (e) {
            console.error('Error while installing session:', e);
        } finally {
            this.loading = false;
            this.isInstallingSession = false;
        }
    }
}

const sessionManager = new SessionManager();
export default sessionManager;
