'use client'

import { Button } from "@/components/Button";
import { sendActionEvent } from '@/hooks/usePageEvent';
import { useSupabase } from "@/context/SupabaseContext";
import { Lock, LockOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export function LockRaidButton({ resetId, currentStatus }: {
    resetId: string
    currentStatus: string | null
}) {
    const isLocked = currentStatus === 'locked'
    const supabase = useSupabase()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const toggleLock = useCallback(async () => {
        setLoading(true)
        sendActionEvent(isLocked ? 'raid_unlock' : 'raid_lock', { resetId });
        const newStatus = isLocked ? null : 'locked'
        const { error } = await supabase
            .from('raid_resets')
            .update({ status: newStatus })
            .eq('id', resetId)

        if (error) {
            console.error('Error toggling lock', error)
        }

        router.refresh()
        setLoading(false)
    }, [isLocked, resetId, supabase, router])

    return (
        <Button
            tooltip={{
                content: isLocked ? "Unlock raid" : "Lock raid",
                placement: "right"
            }}
            isLoading={loading}
            onPress={toggleLock}
            className={`bg-moss text-default font-bold rounded`}
            isIconOnly
        >
            {isLocked ? <Lock size={16} /> : <LockOpen size={16} />}
        </Button>
    )
}
