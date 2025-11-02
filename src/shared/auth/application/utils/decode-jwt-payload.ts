export function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const [, payload] = token.split('.');
        if (!payload) {
            return null;
        }
        const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');
        const decoded = Buffer.from(padded, 'base64').toString('utf-8');
        return JSON.parse(decoded) as Record<string, unknown>;
    } catch {
        return null;
    }
}
