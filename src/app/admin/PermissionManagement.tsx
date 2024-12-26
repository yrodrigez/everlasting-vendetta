"use client"

import React, {useCallback, useState} from "react"
import {
    UserProfile,
    Role,
    RolePermission,
    MemberRole
} from "@/app/admin/types"
import {ROLE_ORDER} from "@utils/constants"
import {useSession} from "@hooks/useSession" // optional

type Props = {
    users: UserProfile[]
    roles: Role[]
    rolePermissions: RolePermission[]
    memberRoles: MemberRole[]
}

export default function PermissionManagement({
                                                 users,
                                                 roles,
                                                 rolePermissions,
                                                 memberRoles
                                             }: Props) {
    // Local state for reactive UI
    const [localMemberRoles, setLocalMemberRoles] = useState(memberRoles)
    const [localRolePermissions, setLocalRolePermissions] = useState(rolePermissions)

    // If you're using a session-based approach for Supabase
    const {supabase: supabaseBrowser} = useSession()


    // ----------------------------------------------------------------
    // USERS WITH ROLES
    // ----------------------------------------------------------------
    const usersWithRoles = users.map((user) => {
        const assignedRoles = localMemberRoles.filter((mr) => mr.member_id === user.id)
        return {user, assignedRoles}
    })

    const handleAddRoleToUser = useCallback(
        async (userId: number, roleId: string) => {
            if (!supabaseBrowser) return
            const {data, error} = await supabaseBrowser
                .from("ev_member_role")
                .insert({member_id: userId, role: roleId})
                .select()
                .single()

            if (error) {
                alert("Error assigning role: " + error.message)
                return
            }
            if (data) {
                setLocalMemberRoles((prev) => [...prev, data])
            }
        },
        [supabaseBrowser]
    )

    const handleRemoveRoleFromUser = useCallback(
        async (memberRoleId: number) => {
            if (!supabaseBrowser) return
            const {error} = await supabaseBrowser
                .from("ev_member_role")
                .delete()
                .eq("id", memberRoleId)

            if (error) {
                alert("Error removing role: " + error.message)
                return
            }
            setLocalMemberRoles((prev) => prev.filter((mr) => mr.id !== memberRoleId))
        },
        [supabaseBrowser]
    )

    // ----------------------------------------------------------------
    // ROLES WITH PERMISSIONS
    // ----------------------------------------------------------------
    const rolesWithPermissions = roles.map((r) => {
        const perms = localRolePermissions.filter((rp) => rp.role === r.id)
        return {role: r, permissions: perms}
    })

    const handleAddPermissionToRole = useCallback(
        async (roleId: string, newPermissionId: string) => {
            if (!supabaseBrowser) return
            const {data, error} = await supabaseBrowser
                .from("ev_role_permissions")
                .insert({id: newPermissionId, role: roleId})
                .select()
                .single()

            if (error) {
                alert("Error adding permission: " + error.message)
                return
            }
            if (data) {
                setLocalRolePermissions((prev) => [...prev, data])
            }
        },
        [supabaseBrowser]
    )

    const handleRemovePermissionFromRole = useCallback(
        async (permissionId: string, roleId: string) => {
            if (!supabaseBrowser) return
            const {error} = await supabaseBrowser
                .from("ev_role_permissions")
                .delete()
                .eq("id", permissionId)
                .eq("role", roleId)

            if (error) {
                alert("Error removing permission: " + error.message)
                return
            }
            setLocalRolePermissions((prev) =>
                prev.filter((rp) => !(rp.id === permissionId && rp.role === roleId))
            )
        },
        [supabaseBrowser]
    )


    return (
        <div className="p-4 flex flex-col h-full min-h-0 gap-8 text-gold">
            <section className="flex flex-col flex-1 min-h-0">
                <h2 className="text-2xl font-bold text-gold flex-shrink-0">
                    Users & Their Roles
                </h2>
                <div className="flex-1 min-h-0 overflow-auto mt-2 relative scrollbar-pill">
                    <div
                        className="table w-full border-collapse border-wood-50 rounded">
                        <div className="table-header-group sticky top-0 z-10 bg-wood text-gold">
                            <div className="table-row">
                                <div className="table-cell p-2 text-left">User</div>
                                <div className="table-cell p-2 text-left">Assigned Roles</div>
                                <div className="table-cell p-2 text-left">Add Role</div>
                            </div>
                        </div>
                        <div className="table-row-group bg-dark">
                            {usersWithRoles.map(({user, assignedRoles}) => {
                                const [tempRoleId, setTempRoleId] = useState("")
                                return (
                                    <div key={user.id} className="table-row hover:bg-dark-100">
                                        <div className="table-cell p-2 border-b border-stone">
                                            {user.character?.name ?? `User #${user.id}`}
                                        </div>
                                        <div className="table-cell p-2 border-b border-stone">
                                            {assignedRoles.length === 0 ? (
                                                <span className="italic opacity-70 text-default">No assigned roles</span>
                                            ) : (
                                                assignedRoles
                                                    .sort(
                                                        (a, b) =>
                                                            ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role)
                                                    )
                                                    .map((ar) => (
                                                        <span
                                                            key={ar.id}
                                                            className="inline-flex items-center px-2 py-1 mr-2 mb-1 bg-wood text-gold rounded"
                                                        >
                              {ar.role}
                                                            <button
                                                                onClick={() => handleRemoveRoleFromUser(ar.id)}
                                                                className="ml-2 text-red-500 font-bold"
                                                            >
                                ✕
                              </button>
                            </span>
                                                    ))
                                            )}
                                        </div>
                                        <div className="table-cell p-2 border-b border-stone">
                                            <select
                                                value={tempRoleId}
                                                onChange={(e) => setTempRoleId(e.target.value)}
                                                className="bg-dark text-gold border-stone rounded px-2 py-1 mr-2 cursor-pointer"
                                            >
                                                <option className="bg-wood text-gold" value="">
                                                    Select Role
                                                </option>
                                                {roles
                                                    .sort(
                                                        (a, b) =>
                                                            ROLE_ORDER.indexOf(a.id) - ROLE_ORDER.indexOf(b.id)
                                                    )
                                                    .map((r) => (
                                                        <option
                                                            key={r.id}
                                                            value={r.id}
                                                            className="bg-wood text-gold"
                                                        >
                                                            {r.id}
                                                        </option>
                                                    ))}
                                            </select>
                                            <button
                                                onClick={() => {
                                                    if (!tempRoleId) return
                                                    handleAddRoleToUser(user.id, tempRoleId)
                                                    setTempRoleId("")
                                                }}
                                                className="bg-moss text-default font-bold rounded hover:opacity-90 cursor-pointer px-2 py-1"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>
            <section className="flex flex-col flex-1 min-h-0">
                <h2 className="text-2xl font-bold text-gold flex-shrink-0">
                    Roles & Permissions
                </h2>
                <div className="flex-1 min-h-0 overflow-auto mt-2 relative">
                    <div
                        className="table w-full border-collapse"
                        style={{border: "1px solid #3A3A3A", borderRadius: 4}}
                    >
                        {/* Sticky header */}
                        <div
                            className="table-header-group sticky top-0 z-10 bg-wood text-gold"
                            style={{position: "sticky"}}
                        >
                            <div className="table-row">
                                <div className="table-cell p-2 text-left">Role</div>
                                <div className="table-cell p-2 text-left">Permissions</div>
                                <div className="table-cell p-2 text-left">Add Permission</div>
                            </div>
                        </div>

                        <div className="table-row-group bg-dark">
                            {rolesWithPermissions
                                .sort(
                                    (a, b) =>
                                        ROLE_ORDER.indexOf(a.role.id) - ROLE_ORDER.indexOf(b.role.id)
                                )
                                .map(({role, permissions}) => {
                                    const [newPermission, setNewPermission] = useState("")
                                    return (
                                        <div key={role.id} className="table-row hover:bg-dark-100">
                                            <div className="table-cell p-2 border-b border-stone">
                                                {role.id}
                                            </div>
                                            <div className="table-cell p-2 border-b border-stone">
                                                {permissions.length === 0 ? (
                                                    <span className="italic opacity-70">No permissions</span>
                                                ) : (
                                                    permissions.map((p) => (
                                                        <span
                                                            key={p.id}
                                                            className="inline-flex items-center px-2 py-1 mr-2 mb-1 bg-wood text-gold rounded"
                                                        >
                              {p.id}
                                                            <button
                                                                onClick={() =>
                                                                    handleRemovePermissionFromRole(p.id, role.id)
                                                                }
                                                                className="ml-2 text-red-500 font-bold"
                                                            >
                                ✕
                              </button>
                            </span>
                                                    ))
                                                )}
                                            </div>
                                            <div className="table-cell p-2 border-b border-stone">
                                                <input
                                                    type="text"
                                                    value={newPermission}
                                                    onChange={(e) => setNewPermission(e.target.value)}
                                                    placeholder="Permission ID"
                                                    className="bg-dark text-gold border border-stone rounded px-2 py-1 mr-2"
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (!newPermission.trim()) return
                                                        handleAddPermissionToRole(role.id, newPermission.trim())
                                                        setNewPermission("")
                                                    }}
                                                    className="hover:opacity-90 cursor-pointer px-2 py-1 rounded text-default bg-moss"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
