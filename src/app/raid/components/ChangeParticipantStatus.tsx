import { RAID_STATUS, type RaidStatusType } from "@/app/raid/components/utils";
import { Button } from "@/components/Button";
import { sendActionEvent } from "@/hooks/usePageEvent";
import {
    faChair,
    faCircleCheck,
    faCircleQuestion,
    faCircleXmark,
    faClock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SupabaseClient } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";

const statusOptions: RaidStatusType[] = [
    RAID_STATUS.CONFIRMED,
    RAID_STATUS.LATE,
    RAID_STATUS.TENTATIVE,
    RAID_STATUS.DECLINED,
    RAID_STATUS.BENCH,
]

const statusConfig: Record<RaidStatusType, { label: string; icon: typeof faCircleCheck; className: string }> = {
    [RAID_STATUS.CONFIRMED]: { label: 'Confirmed', icon: faCircleCheck, className: 'bg-green-700 border-green-600 text-white' },
    [RAID_STATUS.LATE]: { label: 'Late', icon: faClock, className: 'bg-orange-700 border-orange-600 text-white' },
    [RAID_STATUS.TENTATIVE]: { label: 'Tentative', icon: faCircleQuestion, className: 'bg-purple-700 border-purple-600 text-white' },
    [RAID_STATUS.DECLINED]: { label: 'Declined', icon: faCircleXmark, className: 'bg-gray-700 border-gray-600 text-white' },
    [RAID_STATUS.BENCH]: { label: 'Bench', icon: faChair, className: 'bg-yellow-700 border-yellow-600 text-white' },
}

export default function ChangeParticipantStatus({ supabase, resetId, memberId, currentStatus, currentDetails }: {
    supabase?: SupabaseClient,
    resetId: string,
    memberId: number,
    currentStatus?: RaidStatusType,
    currentDetails: any,
}) {
    const { mutate: changeStatus, isPending, variables: pendingStatus } = useMutation({
        mutationKey: ['change-participant-status', resetId, memberId],
        mutationFn: async (status: RaidStatusType) => {
            if (!supabase) return

            sendActionEvent('raid_change_player_status', { resetId, memberId, status })

            const { error } = await supabase
                .from('ev_raid_participant')
                .update({
                    details: {
                        ...currentDetails,
                        status,
                    },
                    is_confirmed: status === RAID_STATUS.CONFIRMED,
                    updated_at: new Date().toISOString(),
                })
                .eq('raid_id', resetId)
                .eq('member_id', memberId)

            if (error) throw error
        },
    })

    return (
        <div className="flex flex-col gap-2 w-full border border-wood-100 p-2 rounded-lg">
            <span className="text-default">Change status</span>
            <div className="flex gap-2 flex-wrap">
                {statusOptions.map(status => {
                    const config = statusConfig[status]
                    return (
                        <Button
                            key={status}
                            isIconOnly
                            onPress={() => changeStatus(status)}
                            isDisabled={isPending || !supabase || currentStatus === status}
                            isLoading={isPending && pendingStatus === status}
                            size="sm"
                            className={`${config.className} rounded border ${currentStatus === status ? 'opacity-50' : ''}`}
                            aria-label={`Change status to ${config.label}`}
                            tooltip={{ content: config.label, placement: 'top' }}
                        >
                            <FontAwesomeIcon icon={config.icon} />
                        </Button>
                    )
                })}
            </div>
        </div>
    )
}
