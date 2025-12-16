'use client'
import {createBrowserClient as createClientComponentClient} from "@supabase/ssr/dist/main/createBrowserClient"
import {useRouter} from "next/navigation";
import {useEffect} from "react";

export default function Refresher() {
    const supabase = createClientComponentClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const router = useRouter()

    useEffect(() => {
        const participantsChannel = supabase.channel('calendar').on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'ev_raid_participant'
        }, async ({}) => {
            router.refresh()
        }).subscribe()

        const calendarChannel = supabase.channel('raid_resets').on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'raid_resets'
        }, async ({}) => {
            router.refresh()
        }).subscribe()

        return () => {
            supabase.removeChannel(participantsChannel)
            supabase.removeChannel(calendarChannel)
        }
    }, [supabase, router]);

    return null
}
