export interface LinkedAccount {
    id: string;
    provider: "bnet" | "battlenet" | "discord" | "bnet_oauth" | "discord_oauth";
    username: string;
    createdAt: string;
    lastSyncAt: string;
    metadata: any;
}
