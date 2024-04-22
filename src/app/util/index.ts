export function getCookie(name: string) {
    if (typeof window === 'undefined') return
    if (!document?.cookie) return
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift()
    return parts.length === 2 ? parts.pop()?.split(';').shift() : undefined;

}

export function getLoggedInUserFromAccessToken(accessToken: string) {
    try {
        const parts = accessToken.split('.')
        const payload = JSON.parse(atob(parts[1]))

        return payload.wow_account
    } catch (e) {
        console.error('Error parsing access token', e)
        return null
    }
}


export function clearAllCookies() {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

export function logout() {
    sessionStorage?.clear()
    clearAllCookies()

    setTimeout(() => {
        sessionStorage?.clear()
        clearAllCookies()
        window.location.href = '/'
    }, 1000)
}
