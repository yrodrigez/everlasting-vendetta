import benchParticipant from "@/app/raid/api/benchParticipant";
import { RAID_STATUS } from "@/app/raid/components/utils";
import { Button } from "@/components/Button";
import { sendActionEvent } from '@/hooks/usePageEvent';
import { faChair, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SupabaseClient } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";

export default function BenchParticipant({ supabase, resetId, memberId, currentStatus, currentDetails }: {
    supabase?: SupabaseClient,
    resetId: string,
    memberId: number,
    currentStatus: string
    currentDetails: any
}) {


    const { mutate: onClick, isPending } = useMutation({
        mutationKey: [RAID_STATUS.BENCH, resetId, memberId],
        mutationFn: async () => {
            if (!supabase) return
            sendActionEvent(currentStatus !== RAID_STATUS.BENCH ? 'raid_bench_player' : 'raid_unbench_player', { resetId, memberId });
            await benchParticipant(supabase, resetId, memberId, currentStatus !== RAID_STATUS.BENCH, currentDetails)
        }
    })

    return <div className="flex items-center gap-2 w-full border border-wood-100 p-2 rounded-lg justify-between">
        <span className="text-default">{currentStatus === RAID_STATUS.BENCH ? 'Unbench player' : 'Bench player'}</span>
        <Button
            isIconOnly
            onPress={() => onClick()}
            isDisabled={isPending || !supabase}
            size="sm"
            isLoading={isPending}
            className={`${currentStatus !== RAID_STATUS.BENCH ? 'bg-orange-600 border-orange-600' : 'bg-green-600'} text-white rounded`}>
            {currentStatus === RAID_STATUS.BENCH ? <FontAwesomeIcon icon={faUser} /> : <FontAwesomeIcon icon={faChair} />}
        </Button>
    </div>
}
