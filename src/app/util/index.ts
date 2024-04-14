export function getCookie(name: string) {
    if (typeof window === 'undefined') return
    if (!document?.cookie) return
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift()
    return parts.length === 2 ? parts.pop()?.split(';').shift() : undefined;

}

export function getLoggedInUserFromAccessToken(accessToken: string) {
    const parts = accessToken.split('.')
    const payload = JSON.parse(atob(parts[1]))

    return payload.wow_account
}
