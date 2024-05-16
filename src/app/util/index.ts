import {ApplyFormStore} from "@/app/apply/components/store";
import {BLIZZARD_LOGOUT_URL} from "@/app/util/constants";
import {toast} from "sonner";


/**
 * Gets the value of a cookie by name
 * @param name - The name of the cookie
 * @returns The cookie value
 * @example
 * getCookie('cookieName')
 */
export function getCookie(name: string) {
    if (typeof window === 'undefined') return
    if (!document?.cookie) return
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift()
    return parts.length === 2 ? parts.pop()?.split(';').shift() : undefined;

}

/**
 * Zustand logger
 * Logs the state changes to the console in development mode only
 * @param config - The zustand config
 * @returns The zustand config
 */
export const zustandLogger = (config: any) => (set: any, get: any, api: any) => {
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

/**
 * Parses the access token and returns the user object
 * @param accessToken - The access token
 * @returns The user object
 * @example
 * getLoggedInUserFromAccessToken('ey48jf...');
 */
export function getLoggedInUserFromAccessToken(accessToken: string) {
    try {
        const parts = accessToken.split('.')
        const payload = JSON.parse(atob(parts[1]))

        return payload.wow_account
    } catch (e) {
        //console.error('Error parsing access token', e)
        return null
    }
}

/**
 * Clears all cookies
 * @returns void
 * @example
 * clearAllCookies()
 */
export function clearAllCookies() {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

/**
 * Logs out the user by clearing the session storage and all cookies
 * and then redirects the user to the home page
 * @returns void
 * @example
 * logout()
 */
export function logout(force: any = false) {
    sessionStorage?.clear()
    clearAllCookies()
    if (typeof force !== 'boolean') window.location.href = '/'

    if (force === true) {
        const message = `You have been logged out - since there is no logout from battle net I need to redirect you to the bnet logout page`
        toast(message, {
            action: {
                label: 'Logout',
                onClick: () => {
                    const logoutWindow = window.open(BLIZZARD_LOGOUT_URL, '_blank',)
                    setTimeout(() => {
                        logoutWindow?.close()
                        window.focus()
                        window.location.href = '/'
                    }, 800)
                }
            },
            onDismiss: () => {
                window.location.href = '/'
            },
            onAutoClose: () => {
                window.location.href = '/'
            }
        })
    }
}
