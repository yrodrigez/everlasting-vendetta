'use client'
import {useSession} from "@hooks/useSession";
import {useEffect, useRef, useState} from "react";
import {toast} from "sonner";
import Link from "next/link";
import {Button} from "@/app/components/Button";
import {useQuery} from "@tanstack/react-query";
import {usePathname, useRouter} from "next/navigation";
import {GUILD_ID} from "@utils/constants";
import {useMessageBox} from "@utils/msgBox";

import {ItemWithTooltip} from "@/app/raid/[id]/loot/components/LootItem";

function useReservationAlert(someoneReservedMoreThanMe: false | { resetId: string, itemId: number, item?: any }) {
    const localStorageKey = 'lastReservationAlert'
    const [lastAlert, setLastAlert] = useState<any>(null)
    const pathName = usePathname()
    const router = useRouter()
    const soundPlayedRef = useRef(false)
    const alertTimeout = useRef<NodeJS.Timeout | undefined>()
    const {alert} = useMessageBox()

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
                const {item} = someoneReservedMoreThanMe
                const resetPath = `/raid/${someoneReservedMoreThanMe.resetId}/soft-reserv`

                alert({
                    title: 'Someone reserved an item more times you!',
                    message: (
                        item ? (
                                <div>
                                    The item <div className="inline-flex justfy-between items-end">
                                    <ItemWithTooltip item={item}/> {item.name}</div> has more reservations
                                    than yours.
                                    <br/>
                                    Please remember that someone with more reserves than you have priority over the item.
                                    <br/>
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
    const {supabase, selectedCharacter, tokenUser} = useSession();
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

    const {data: someoneReservedMoreThanMe, refetch} = useQuery({
        queryKey: ['reservation', selectedCharacter?.id],
        queryFn: async () => {
            if (!selectedCharacter?.id || !supabase) return false

            const dateOnly = new Date().toISOString().split('T')[0]

            const {data: firstResetInFuture} = await supabase.from('raid_resets')
                .select('id')
                .gte('raid_date', dateOnly)
                .eq('reservations_closed', false)
                .order('raid_date', {ascending: true})
                .limit(1)
                .maybeSingle()

            if (!firstResetInFuture) {
                return false
            }

            const {data, error} = await supabase.from('raid_loot_reservation')
                .select('item_id, member_id')
                .eq('reset_id', firstResetInFuture.id)
                .returns<{ item_id: number, member_id: number }[]>()

            if (error) {
                console.error(error)
                return false
            }

            const myReservations = data?.filter((x: any) => x.member_id === selectedCharacter.id).reduce((acc: any, x: any) => {
                acc[x.item_id] = (acc[x.item_id] ?? 0) + 1
                return acc
            }, {} as { [key: number]: number }) ?? []

            const otherReservations = data?.filter((x: any) => x.member_id !== selectedCharacter.id)
                .reduce((acc: { [memberId: number]: { [itemId: number]: number } }, x: any) => {
                    if (!acc[x.member_id]) {
                        acc[x.member_id] = {}
                    }
                    acc[x.member_id][x.item_id] = (acc[x.member_id][x.item_id] ?? 0) + 1
                    return acc
                }, {}) ?? []

            for (const [itemIdStr, myCount] of Object.entries(myReservations)) {
                const itemId = parseInt(itemIdStr, 10)
                if (typeof myCount !== 'number') continue
                for (const memberId in otherReservations) {
                    const otherCount = otherReservations[memberId][itemId] || 0
                    if (otherCount > myCount) {
                        const {
                            data: item,
                            error: isItemError
                        } = await supabase.from('raid_loot_item').select('description').eq('id', itemId).single()
                        if (isItemError) {
                            console.error(isItemError)
                            return {resetId: firstResetInFuture.id, itemId}
                        }
                        return {resetId: firstResetInFuture.id, itemId, item: item?.description}
                    }
                }
            }
            return false
        },
        refetchInterval: 30000,
        enabled: !!selectedCharacter?.id && !!supabase,
    })

    useEffect(() => {
        if (!supabase) return
        const channel = supabase.channel(`raid_loot_reservation`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'raid_loot_reservation',
            }, async () => {
                refetch()
            }).subscribe()
        refetch()
        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, refetch]);

    useReservationAlert(
        someoneReservedMoreThanMe as false | { resetId: string, itemId: number, item?: any }
    )

    return {
        applyCount,
        canReadApplications: (tokenUser?.permissions?.indexOf('applications.read') !== -1 && tokenUser?.guild?.id === GUILD_ID),
        applicants
    }
}
