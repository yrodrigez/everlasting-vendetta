import {createServerComponentClient} from "@/app/util/supabase/createServerComponentClient";
import {type SupabaseClient} from "@supabase/supabase-js";
import {UserProfile} from "@/app/util/supabase/types";

export function getLoggedInUserFromAccessToken(accessToken: string) {
    try {
        const parts = accessToken.split('.');
        if (parts.length < 2) {
            return null;
        }

        const payloadJson = decodeBase64ToString(parts[1]);

        const payload = JSON.parse(payloadJson);

        return payload.wow_account ?? null;
    } catch (e) {
        return null;
    }
}

function decodeBase64ToString(base64: string): string {
    if (typeof TextDecoder !== 'undefined') {
        const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
        return new TextDecoder('utf-8').decode(bytes);
    } else {
        const asciiString = atob(base64);
        return decodeURIComponent(
            asciiString
            .split('')
            .map((char) =>
                '%' + char.charCodeAt(0).toString(16).padStart(2, '0')
            )
            .join('')
        );
    }
}


export default async function createServerSession({cookies}: { cookies: any }): Promise<{
    supabase: SupabaseClient,
    auth: { getSession: () => Promise<void | UserProfile> }
}> {
    if (!cookies) {
        throw new Error('cookies is required')
    }

    const supabaseToken = (await cookies()).get('evToken')?.value
    const supabase = createServerComponentClient({supabaseToken})

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

    async function getSession(): Promise<UserProfile> {
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
