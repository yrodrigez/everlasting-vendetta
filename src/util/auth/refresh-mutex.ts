let refreshInFlight = null as null | Promise<{ ok: boolean, token?: string }>
const broadCast = typeof window !== 'undefined' ? new BroadcastChannel('auth') : null

export function withRefreshMutex(fn: () => Promise<{ ok: boolean, accessToken?: string }>) {
    if (refreshInFlight) return refreshInFlight
    refreshInFlight = fn()
        .then((res: { ok: boolean, accessToken?: string }) => {
            if (broadCast) {
                broadCast.postMessage({ type: 'refreshed', accessToken: res.accessToken, ok: res.ok })
            }
            return res
        })
        .catch(() => {
            if (broadCast) {
                broadCast.postMessage({ type: 'refresh-failed', ok: false })
            }
            return { ok: false }
        })
        .finally(() => { refreshInFlight = null })
    return refreshInFlight
}