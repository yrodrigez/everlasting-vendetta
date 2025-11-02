'use client'
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/app/components/Button";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { GUILD_ID } from "@utils/constants";
import { useMessageBox } from "@utils/msgBox";

import { ItemWithTooltip } from "@/app/raid/[id]/loot/components/LootItem";
import { useShallow } from "zustand/react/shallow";
import { useCharacterStore } from "../components/characterStore";
import { useAuth } from "../context/AuthContext";
import { createClientComponentClient } from "../util/supabase/createClientComponentClient";

function useReservationAlert(someoneReservedMoreThanMe: false | { resetId: string, itemId: number, item?: any }) {
    const localStorageKey = 'lastReservationAlert'
    const [lastAlert, setLastAlert] = useState<any>(null)
    const pathName = usePathname()
    const router = useRouter()
    const soundPlayedRef = useRef(false)
    const alertTimeout = useRef<NodeJS.Timeout | undefined>(undefined)
    const { alert } = useMessageBox()

    useEffect(() => {
        if (!localStorage) return
        const saved = localStorage.getItem(localStorageKey)
        const lastAlert = saved ? JSON.parse(saved) : null
        if (!someoneReservedMoreThanMe) return
        if (
            !lastAlert ||
            lastAlert.resetId !== someoneReservedMoreThanMe.resetId ||
            lastAlert.itemId !== someoneReservedMoreThanMe.itemId
        ) {
            soundPlayedRef.current = false

            if (alertTimeout.current) clearTimeout(alertTimeout.current)

            alertTimeout.current = setTimeout(() => {
                const { item } = someoneReservedMoreThanMe
                const resetPath = `/raid/${someoneReservedMoreThanMe.resetId}/soft-reserv`

                alert({
                    title: 'Someone reserved an item more times you!',
                    message: (
                        item ? (
                            <div>
                                The item <div className="inline-flex justfy-between items-end">
                                    <ItemWithTooltip item={item} /> {item.name}</div> has more reservations
                                than yours.
                                <br />
                                Please remember that someone with more reserves than you have priority over the item.
                                <br />
                                For more information, read the loot rules <Link href={'/terms'}
                                    className="text-battlenet">here</Link>.
                            </div>
                        ) :
                            (
                                <div>
                                    You have been outbid on a loot reservation. Please review your reservations.
                                </div>
                            )
                    ),
                    type: "error",
                    actionOnClose: () => {
                        if (pathName !== resetPath) {
                            router.push(resetPath)
                        }
                    }
                })

                if (!soundPlayedRef.current) {
                    const alertSound = new Audio('/sounds/warning.ogg')
                    alertSound.play()
                    soundPlayedRef.current = true
                }

                setLastAlert(someoneReservedMoreThanMe)
                localStorage.setItem(localStorageKey, JSON.stringify(someoneReservedMoreThanMe))
            }, 500)
        }

        return () => {
            if (alertTimeout.current) clearTimeout(alertTimeout.current)
        }
    }, [someoneReservedMoreThanMe, lastAlert, router, pathName, alert])
}

export default function useApplicants() {
    const { accessToken, user } = useAuth();
    const supabase = useMemo(() => createClientComponentClient(accessToken), [accessToken]);

    const selectedCharacter = useCharacterStore(useShallow(state => state.selectedCharacter));
    const router = useRouter();
    const [applyCount, setApplyCount] = useState(0)

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
                        <Button as="a" href={'/apply/list'} size="sm">Review</Button>
                    </div>
                ), {
                    duration: Infinity,
                    position: 'bottom-right',
                })
                new Audio('/sounds/MagicClick.ogg').play().finally(() => { })
                router.refresh()
            }).subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, selectedCharacter, selectedCharacter?.id]);

    const { data: applicants } = useQuery({
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
            setApplyCount(() => data?.length ?? 0)
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
                        <Button
                            as="a"
                            href={'/apply/list'}
                            size="sm">Review</Button>
                    </Link>
                </div>
            ), {
                duration: Infinity,
                position: 'bottom-right',
            })
            localStorage.setItem('shownApplicants', JSON.stringify([...shownApplicants, ...newApplicants.map((x: any) => x.id)]))
            new Audio('/sounds/MagicClick.ogg').play().finally(() => { })
        }
    }, [applicants]);

    return {
        applyCount,
        canReadApplications: (user?.permissions?.includes('applications.read') && selectedCharacter?.guild?.id === GUILD_ID),
        applicants
    }
}
