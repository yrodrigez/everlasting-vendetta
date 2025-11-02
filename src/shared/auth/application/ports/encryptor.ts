export interface Encryptor<TPayload = unknown> {
    encrypt(plainText: string): Promise<TPayload>;
}
