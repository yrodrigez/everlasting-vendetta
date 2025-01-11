import {getCookie, getLoggedInUserFromAccessToken, logout} from "@/app/util";
import {toast} from "sonner";
import {BNET_COOKIE_NAME, EV_COOKIE_NAME, LOGIN_URL, LOGIN_URL_TEMPORAL} from "@/app/util/constants";
import {type Character} from "@/app/components/characterStore";
import {type AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";
import {createClient as createClientComponentClient, type SupabaseClient} from "@supabase/supabase-js";

export async function performTemporalLogin(selectedCharacter: Character): Promise<{ error?: string, ok: boolean }> {
	const temporalAuthResponse = await fetch(LOGIN_URL_TEMPORAL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({character: selectedCharacter})
	});

	if (!temporalAuthResponse.ok) {
		const {error} = await temporalAuthResponse.json();
		console.error('Error while installing session:', error);
		return {error: error, ok: temporalAuthResponse.ok};
	}

	return {ok: temporalAuthResponse.ok};
}


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
		router: AppRouterInstance,
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

			if (!bnetToken && !access_token && selectedCharacter.isTemporal) {
				const {error, ok} = await performTemporalLogin(selectedCharacter);
				if (!ok) {
					console.error('Error while installing session:', error);
					toast.error(`Failed to install session: ${error}`, {
						duration: 2500,
						onDismiss: clearSession,
						onAutoClose: clearSession,
					});
					return;
				}

				return router.refresh();
			}

			if (!bnetToken && !access_token) {
				router.replace(`${LOGIN_URL}?redirectedFrom=${pathName}`);
				return;
			}

			this.bnetToken = bnetToken;

			if (access_token) {
				const currentCookieCharacter = getLoggedInUserFromAccessToken(access_token);
				if (currentCookieCharacter?.id === selectedCharacter.id) {
					this.supabase = createClientComponentClient(
						process.env.NEXT_PUBLIC_SUPABASE_URL!,
						process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
						{
							global: {
								headers: {
									Authorization: `Bearer ${access_token}`
								}
							},
							realtime: {
								accessToken: async () => access_token
							}
						});
					this.supabase.realtime.accessToken = async () => access_token
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
				this.supabase = createClientComponentClient(
					process.env.NEXT_PUBLIC_SUPABASE_URL!,
					process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
					{
						global: {
							headers: {
								Authorization: `Bearer ${newAccessToken}`
							}
						},
						realtime: {
							accessToken: async () => newAccessToken
						}
					});
				this.session = getLoggedInUserFromAccessToken(newAccessToken);
				this.tokenUser = getLoggedInUserFromAccessToken(newAccessToken);
				this.supabase.realtime.accessToken = async () => newAccessToken
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
