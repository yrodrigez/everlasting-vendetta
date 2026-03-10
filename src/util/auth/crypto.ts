import 'server-only'
// Edge runtime: usa Web Crypto (no node:crypto)
const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

// helpers base64 seguros en Edge y Node
const b64ToBytes = (b64: string): Uint8Array => {
    if (typeof atob === 'function') {
        const bin = atob(b64)
        const bytes = new Uint8Array(bin.length)
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
        return bytes
    }
    // fallback Node
    return Uint8Array.from(Buffer.from(b64, 'base64'))
}

const bytesToB64 = (bytes: ArrayBuffer | Uint8Array): string => {
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
    if (typeof btoa === 'function') {
        let bin = ''
        for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i])
        return btoa(bin)
    }
    // fallback Node
    return Buffer.from(u8).toString('base64')
}

const importAesGcmKey = async (): Promise<CryptoKey> => {
    const b64 = process.env.ENCRYPTION_KEY_B64
    if (!b64) throw new Error('ENCRYPTION_KEY_B64 is not set')
    const raw = b64ToBytes(b64)
    if (raw.byteLength !== 32) throw new Error('ENCRYPTION_KEY_B64 must decode to 32 bytes')
    // @ts-ignore
    return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

export const encrypt = async (plaintext: string) => {
    const key = await importAesGcmKey()
    const iv = crypto.getRandomValues(new Uint8Array(12)) // 12 bytes para GCM
    const enc = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        textEncoder.encode(plaintext)
    )
    return {
        iv: bytesToB64(iv),
        // empaquetamos: [ciphertext|tag] igual que Node
        ciphertext: bytesToB64(enc)
    }
}

export const decrypt = async (opts: { iv: string, ciphertext: string }) => {
    if(!opts.iv || !opts.ciphertext) throw new Error('Invalid decrypt options')
    const key = await importAesGcmKey()
    const iv = b64ToBytes(opts.iv)
    if (iv.byteLength !== 12) throw new Error('IV must be 12 bytes')
    const payload = b64ToBytes(opts.ciphertext)

    // Web Crypto acepta [ciphertext|tag] en un único ArrayBuffer, como en tu formato
    const dec = await crypto.subtle.decrypt(
        // @ts-ignore
        { name: 'AES-GCM', iv },
        key,
        payload
    )
    return textDecoder.decode(dec)
}
