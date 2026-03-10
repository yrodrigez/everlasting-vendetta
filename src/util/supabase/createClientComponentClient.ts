import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let globalClient: SupabaseClient | null = null;
let currentAccessToken: string | null = null;

export function createClientComponentClient(accessToken?: string | null): SupabaseClient {
    // Store the latest access token globally

    if (accessToken !== undefined && currentAccessToken !== accessToken && globalClient) {
        globalClient.removeAllChannels();
    }


    currentAccessToken = accessToken ?? null;

    // Create singleton client only once
    if (!globalClient) {
        globalClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                // This function reads currentAccessToken dynamically each time it's called
                accessToken: async () => currentAccessToken,
            }
        );
    }

    // Update realtime auth when token changes
    if (currentAccessToken) {
        globalClient.realtime.setAuth(currentAccessToken);
        globalClient.functions.setAuth(currentAccessToken);
    }

    return globalClient;
}