import {createServerComponentClient} from "@/app/util/supabase/createServerComponentClient";
import {type SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {UserProfile} from "@/app/util/supabase/types";

function getLoggedInUserFromAccessToken(accessToken: string) {
    try {
        const parts = accessToken.split('.')
        const payload = JSON.parse(atob(parts[1]))

        return payload.wow_account
    } catch (e) {
        //console.error('Error parsing access token', e)
        return null
    }
}


export default function createServerSession({cookies}: { cookies: any }): {
    supabase: SupabaseClient,
    auth: { getSession: () => Promise<void | UserProfile> }
} {
    if (!cookies) {
        throw new Error('cookies is required')
    }

    const supabase = createServerComponentClient({cookies})
    const supabaseToken = cookies().get('evToken')?.value

    if (!supabaseToken) {
        return {
            supabase, auth: {
                getSession: async () => {
                }
            }
        }
    }

    const user = getLoggedInUserFromAccessToken(supabaseToken)
    if (!user) {
        return {
            supabase, auth: {
                getSession: async () => {
                }
            }
        }
    }

    async function getSession() {
        const {
            data: roles,
            error: rolesError
        } = await supabase.from('ev_member_role').select('role').eq('member_id', user.id)
        if (rolesError) {
            throw new Error('Error fetching roles' + JSON.stringify(rolesError))
        }

        const {
            data: rolePermissions,
            error: rolePermissionsError
        } = await supabase.from('ev_role_permissions').select('id').in('role', roles.map((role: any) => role.role))
        if (rolePermissionsError) {
            throw new Error('Error fetching role permissions' + JSON.stringify(rolePermissionsError))
        }

        return {
            ...user,
            roles: roles ? Array.from(new Set(roles.map((role: any) => role.role)).values()) : [],
            permissions: rolePermissions ? Array.from(new Set(rolePermissions.map((rolePermission: any) => rolePermission.id)).values()) : []
        }
    }


    return {supabase, auth: {getSession}}
}
