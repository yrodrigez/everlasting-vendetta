import {type SupabaseClient, createClient as createServerClient} from "@supabase/supabase-js";
//import {createServerClient} from "@supabase/ssr";
import {cookies} from "next/headers";

export function createServerComponentClient() {
    if (!cookies) {
        throw new Error('cookies is required')
    }
    const supabaseToken = cookies().get('evToken')?.value ?? null

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
