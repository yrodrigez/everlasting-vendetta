// Domain Models
export interface DiscordUser {
    readonly id: string;
    readonly username: string;
    readonly discriminator: string;
    readonly avatar?: string;
    readonly email?: string;
}

export interface DiscordGuild {
    readonly id: string;
    readonly name: string;
    readonly icon?: string;
    readonly owner: boolean;
}

// Repository Interface
export interface DiscordRepository {
    getUser(accessToken: string): Promise<DiscordUser>;
    getUserGuilds(accessToken: string): Promise<DiscordGuild[]>;
}

// Infrastructure Implementation
class DiscordApiRepository implements DiscordRepository {
    private readonly baseUrl = 'https://discord.com/api';

    async getUser(accessToken: string): Promise<DiscordUser> {
        const response = await fetch(`${this.baseUrl}/users/@me`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!response.ok) {
            throw new Error(`Discord API error: ${response.status}`);
        }

        return response.json();
    }

    async getUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
        const response = await fetch(`${this.baseUrl}/users/@me/guilds`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!response.ok) {
            throw new Error(`Discord API error: ${response.status}`);
        }

        return response.json();
    }
}

// Use Cases
export class GetDiscordUserUseCase {
    constructor(private readonly repository: DiscordRepository) {}

    async execute(accessToken: string): Promise<DiscordUser> {
        if (!accessToken) throw new Error('Access token is required');
        return this.repository.getUser(accessToken);
    }
}

export class GetDiscordUserGuildsUseCase {
    constructor(private readonly repository: DiscordRepository) {}

    async execute(accessToken: string): Promise<DiscordGuild[]> {
        if (!accessToken) throw new Error('Access token is required');
        return this.repository.getUserGuilds(accessToken);
    }
}

// Factory
export function createDiscordServices() {
    const repository = new DiscordApiRepository();

    return {
        getUserUseCase: new GetDiscordUserUseCase(repository),
        getUserGuildsUseCase: new GetDiscordUserGuildsUseCase(repository)
    };
}