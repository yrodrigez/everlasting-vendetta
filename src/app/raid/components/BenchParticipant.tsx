import {SupabaseClient} from "@supabase/supabase-js";
import {Button} from "@/app/components/Button";
import {faChair, faUser, faUserSlash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useMutation} from "@tanstack/react-query";
import benchParticipant from "@/app/raid/api/benchParticipant";
import {RAID_STATUS} from "@/app/raid/components/utils";

export default function BenchParticipant({supabase, resetId, memberId, currentStatus, currentDetails}: {
    supabase?: SupabaseClient,
    resetId: string,
    memberId: number,
    currentStatus: string
    currentDetails: any
}) {


    const {mutate: onClick, isPending} = useMutation({
        mutationKey: [RAID_STATUS.BENCH, resetId, memberId],
        mutationFn: async () => {
            if (!supabase) return
            await benchParticipant(supabase, resetId, memberId, currentStatus !== RAID_STATUS.BENCH, currentDetails)
        }
    })

    return <Button
        isIconOnly
        onPress={() => onClick()}
        isDisabled={isPending || !supabase}
        size="sm"
        isLoading={isPending}
        className={`${currentStatus !== RAID_STATUS.BENCH ? 'bg-red-800 border-red-600' : 'bg-green-600'} text-white rounded`}>
        {currentStatus === RAID_STATUS.BENCH ? <FontAwesomeIcon icon={faUser}/> : <FontAwesomeIcon icon={faChair}/>}
    </Button>
}
