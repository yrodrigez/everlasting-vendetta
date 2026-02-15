export function toB64Url(obj: any) {
    const json = JSON.stringify(obj)
    const b64 = btoa(unescape(encodeURIComponent(json)))
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function setCookie(name: string, value: string, days = 180) {
    const expires = new Date(Date.now() + 15000 * 60).toUTCString()
    document.cookie = `${name}=${value}; Expires=${expires}; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
}

export function deleteCookie(name: string) {
    document.cookie = name + '=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '')
    // Also expire domain-scoped cookies in production
    if (location.hostname.includes('everlastingvendetta.com')) {
        document.cookie = name + '=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax; Domain=.everlastingvendetta.com' + (location.protocol === 'https:' ? '; Secure' : '')
    }
}