export class SessionManagementError extends Error {
    readonly statusCode: number;

    constructor(message: string, statusCode: number, options?: { cause?: unknown }) {
        super(message);
        this.name = 'SessionManagementError';
        this.statusCode = statusCode;
        if (options?.cause !== undefined) {
            (this as { cause?: unknown }).cause = options.cause;
        }
    }
}
