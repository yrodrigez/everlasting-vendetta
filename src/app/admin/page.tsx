import createServerSession from "@utils/supabase/createServerSession";
import { GUILD_ID, ROLE } from "@utils/constants";
import { MemberRole, Role, RolePermission, UserProfile } from "@/app/admin/types";
import PermissionManagement from "@/app/admin/PermissionManagement";

export default async function Page() {
    const { auth, getSupabase } = await createServerSession();
    const supabase = await getSupabase();
    const session = await auth.getSession()

    if (!session || !session.id || !session.roles?.includes(ROLE.ADMIN)) {
        return <div
            className="w-full h-full flex items-center justify-center text-4xl text-red-500 font-bold flex-col gap-4"
        >
            <span className="text-9xl">🚫</span>
            <span>Unauthorized</span>
        </div>
    }

    const { data: members, error: membersError } = await supabase.from('ev_member').select('*')
        .filter('character->guild->id', 'eq', GUILD_ID)
        .overrideTypes<UserProfile[]>()

    if (membersError) {
        return <div
            className="w-full h-full flex items-center justify-center text-4xl text-red-500 font-bold flex-col gap-4"
        >
            <span className="text-9xl">🚫</span>
            <span>Error fetching members</span>
        </div>
    }

    const { data: roles, error: rolesError } = await supabase.from('ev_role').select('*')
        .filter('id', 'neq', ROLE.ADMIN)
        .overrideTypes<Role[]>()

    if (rolesError) {
        return <div
            className="w-full h-full flex items-center justify-center text-4xl text-red-500 font-bold flex-col gap-4"
        >
            <span className="text-9xl">🚫</span>
            <span>Error fetching roles</span>
        </div>
    }

    const {
        data: rolePermissions,
        error: rolePermissionsError
    } = await supabase.from('ev_role_permissions').select('*').overrideTypes<RolePermission[]>()

    if (rolePermissionsError) {
        return <div
            className="w-full h-full flex items-center justify-center text-4xl text-red-500 font-bold flex-col gap-4"
        >
            <span className="text-9xl">🚫</span>
            <span>Error fetching role permissions</span>
        </div>
    }

    const {
        data: memberRoles,
        error: memberRolesError
    } = await supabase.from('ev_member_role').select('*').overrideTypes<MemberRole[]>()
    if (memberRolesError) {
        return <div
            className="w-full h-full flex items-center justify-center text-4xl text-red-500 font-bold flex-col gap-4"
        >
            <span className="text-9xl">🚫</span>
            <span>Error fetching member roles</span>
        </div>
    }


    console.log({ roles })

    return <PermissionManagement
        users={members ?? []}
        roles={roles ?? []}
        rolePermissions={rolePermissions ?? []}
        memberRoles={memberRoles ?? []}
    />
}
