export class GetUserCharactersError extends Error {
    readonly statusCode: number;

    constructor(message: string, statusCode: number, options?: { cause?: unknown }) {
        super(message);
        this.name = 'GetUserCharactersError';
        this.statusCode = statusCode;
        if (options?.cause !== undefined) {
            (this as { cause?: unknown }).cause = options.cause;
        }
    }
}
