'use client'
import { useSupabase, safeChannel } from "@/context/SupabaseContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Refresher() {
    const supabase = useSupabase()
    const router = useRouter()

    useEffect(() => {
        const participantsChannel = safeChannel(supabase, 'calendar').on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'ev_raid_participant'
        }, async () => {
            router.refresh()
        }).subscribe()

        const calendarChannel = safeChannel(supabase, 'raid_resets').on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'raid_resets'
        }, async () => {
            router.refresh()
        }).subscribe()

        return () => {
            supabase.removeChannel(participantsChannel)
            supabase.removeChannel(calendarChannel)
        }
    }, [supabase, router]);

    return null
}
