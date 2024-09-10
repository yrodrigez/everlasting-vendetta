import {createServerComponentClient as createSupabase} from "@supabase/auth-helpers-nextjs";

function createServerComponentClient({cookies}: { cookies: any }) {
    if (!cookies) {
        throw new Error('cookies is required')
    }

    const supabaseToken = cookies().get('evToken')?.value

    const options = !supabaseToken ? {} : {
        options: {
            global: {
                headers: {
                    Authorization: `Bearer ${supabaseToken}`
                }
            }
        }
    }

    return createSupabase({cookies}, options)
}