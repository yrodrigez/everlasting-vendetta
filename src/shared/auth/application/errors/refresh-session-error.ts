export class RefreshSessionError extends Error {
    readonly statusCode: number;

    constructor(message: string, statusCode: number, options?: { cause?: unknown }) {
        super(message);
        this.name = 'RefreshSessionError';
        this.statusCode = statusCode;
        if (options?.cause !== undefined) {
            // Preserve the original cause for logging/upstream handling
            (this as { cause?: unknown }).cause = options.cause;
        }
    }
}
