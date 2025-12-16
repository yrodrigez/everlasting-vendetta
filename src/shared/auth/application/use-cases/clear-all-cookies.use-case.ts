import type { SessionStore } from '../ports/session-store';

export class ClearAllCookiesUseCase {
    constructor(private readonly dependencies: { sessionStore: SessionStore }) { }

    async execute(): Promise<void> {
        await this.dependencies.sessionStore.clear();
    }
}
