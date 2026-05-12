import { getRoleIcon } from "@/app/apply/components/utils";
import { Button } from "@/components/Button";
import { isRoleAssignable } from "@/components/ProfileManager";
import { sendActionEvent } from "@/hooks/usePageEvent";
import { PLAYABLE_ROLES } from "@/util/constants";
import { SupabaseClient } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";

export default function ChangeParticipantRole({ supabase, resetId, memberId, currentDetails }: {
    supabase?: SupabaseClient,
    resetId: string,
    memberId: number,
    currentDetails: any,
}) {

    const characterClass = currentDetails?.className || 'mage'
    const assignableRoles = useMemo(() => {
        return new Set(Object.values(PLAYABLE_ROLES).filter(r => !r.value.includes('-')).filter(role => role.value.split('-').every((x: string) => isRoleAssignable(x.toLowerCase(), characterClass?.toLowerCase(), 'spineshatter'))).map(r => r.value))
    }, [characterClass])

    const { mutate: changeRole, isPending, variables: pendingRole } = useMutation({
        mutationKey: ['change-participant-role', resetId, memberId],
        mutationFn: async (role: string) => {
            if (!supabase) return

            sendActionEvent('raid_change_player_role', { resetId, memberId, previousRole: currentDetails?.role, newRole: role })

            const { error } = await supabase
                .from('ev_raid_participant')
                .update({
                    details: {
                        ...currentDetails,
                        role,
                    },
                    updated_at: new Date().toISOString(),
                })
                .eq('raid_id', resetId)
                .eq('member_id', memberId)

            if (error) throw error
        },
    })

    return (
        <div className="flex flex-col gap-2 w-full border border-wood-100 p-2 rounded-lg">
            <span className="text-default">Change role</span>
            <div className="flex gap-2 flex-wrap">
                {Array.from(assignableRoles).map(role => (
                    <Button
                        key={role}
                        isIconOnly
                        onPress={() => changeRole(role)}
                        isDisabled={isPending || !supabase || currentDetails?.role === role}
                        isLoading={isPending && pendingRole === role }
                        size="sm"
                        className="bg-moss text-default rounded border border-moss-100"
                        aria-label={`Change role to ${role}`}
                    >
                        <img className="w-5 h-5 rounded-full" src={getRoleIcon(role)} alt={role} />
                    </Button>
                ))}
            </div>
        </div>
    )
}
