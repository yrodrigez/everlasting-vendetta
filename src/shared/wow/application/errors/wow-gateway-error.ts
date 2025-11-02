export class WowGatewayError extends Error {
    readonly status: number;
    readonly payload?: unknown;

    constructor(message: string, status: number, payload?: unknown) {
        super(message);
        this.name = 'WowGatewayError';
        this.status = status;
        this.payload = payload;
    }
}
