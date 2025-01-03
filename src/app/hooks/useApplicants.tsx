'use client'
import {useSession} from "@hooks/useSession";
import {useEffect} from "react";
import {toast} from "sonner";
import Link from "next/link";
import {Button} from "@/app/components/Button";
import {useQuery} from "@tanstack/react-query";
import {useRouter} from "next/navigation";

export default function useApplicants() {
    const {supabase, selectedCharacter} = useSession();
    const router = useRouter();
    useEffect(() => {
        if (!supabase) return;

        const channel = supabase.channel(`applications`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'ev_application',
            }, async () => {
                toast.custom(() => (
                    <div
                        className="flex gap-2 items-center bg-wood border border-gold p-4 rounded-lg text-default glow-animation">
                        <div>Someone has applied!</div>
                        <Link href={'/apply/list'}>
                            <Button size="sm">Review</Button>
                        </Link>
                    </div>
                ), {
                    duration: Infinity,
                    position: 'bottom-right',
                })
                new Audio('/sounds/MagicClick.ogg').play()
                router.refresh()
            }).subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, selectedCharacter, selectedCharacter?.id]);

    const {data: applicants} = useQuery({
        queryKey: ['applicants'],
        queryFn: async () => {
            if (!supabase) return
            const {
                data,
                error
            } = await supabase.from('ev_application').select('created_at, id')
                .is('reviewed_by', null)
                .returns<{
                    created_at: string,
                    id: string,
                    name: string,
                    message: string,
                    class: string,
                    role: string,
                    status: string,
                    reviewer: { character: { name: string, avatar: string } }
                }[]>()
            if (error) {
                throw error
            }
            return data
        },
        refetchInterval: 60000,
        enabled: !!supabase,
    })

    useEffect(() => {
        if (!applicants || !localStorage) return
        const shownApplicants = JSON.parse(localStorage?.getItem('shownApplicants') ?? '[]')
        const newApplicants = applicants.filter((x: any) => !shownApplicants.includes(x.id))

        if (newApplicants.length > 0) {
            toast.custom(() => (
                <div
                    className="flex gap-2 items-center bg-wood border border-gold rounded-lg text-default glow-animation p-4">
                    <div>
                        {newApplicants.length} new applicant{newApplicants.length > 1 ? 's' : ''}!
                    </div>
                    <Link href={'/apply/list'}>
                        <Button size="sm">Review</Button>
                    </Link>
                </div>
            ), {
                duration: Infinity,
                position: 'bottom-right',
            })
            localStorage.setItem('shownApplicants', JSON.stringify([...shownApplicants, ...newApplicants.map((x: any) => x.id)]))
            new Audio('/sounds/MagicClick.ogg').play()
        }
    }, [applicants]);

}
