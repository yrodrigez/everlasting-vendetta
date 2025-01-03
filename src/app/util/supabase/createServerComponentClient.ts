import {type SupabaseClient, createClient as createServerClient} from "@supabase/supabase-js";

export function createServerComponentClient({supabaseToken}: { supabaseToken: any }): SupabaseClient {
    const withAuthToken = !supabaseToken ? {} : {
        global: {
            headers: {
                Authorization: `Bearer ${supabaseToken}`
            }
        }
    }

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
            realtime: {
                accessToken: async () => {
                    return supabaseToken ?? null
                }
            },
            ...withAuthToken
        }
    ) as SupabaseClient
}
