'use client'
import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react'
import type { Character, RaidItem, Reservation } from "@/app/raid/[id]/soft-reserv/types"
import { useReservationsRealtime } from './use-reservations-realtime'
import { createClientComponentClient } from '@/app/util/supabase/createClientComponentClient'
import { useAuth } from '@/app/context/AuthContext'
import { ReservationsRepository } from './reservations-repository'
import { useCharacterStore } from '@/app/components/characterStore'
import { useQuery } from '@tanstack/react-query'
import { Day } from '@/app/calendar/new/Components/useCreateRaidStore'
import { toast } from 'sonner'
import { registerOnRaid } from '@/app/lib/database/raid_resets/registerOnRaid'
import { MemberRole } from '@/app/types/Member'
import { useMessageBox } from '@/app/util/msgBox'


interface RaidItemsContextType {
    items: RaidItem[]
    isReservationsOpen: boolean
    setIsReservationsOpen: (open: boolean) => void
    reserves: Reservation[]
    setReserves: (items: Reservation[]) => void
    maxReservations: number
    setMaxReservations: (maxReservations: number) => void
    yourReserves: Reservation[]
    reservesByItem: { item: RaidItem, reservations: any[] }[]
    isLoading: boolean
    isPending: boolean
    isPresent: boolean
    resetDays: Day[]
    reserve: (itemId: number, characterId?: number) => Promise<void>
    remove: (reserveId: string) => Promise<void>
    hardReserve: (itemId: number) => Promise<void>
    removeHardReserve: (itemId: number) => Promise<void>
    toggleReservationsOpen: () => Promise<void>
    repository: ReservationsRepository
}

const RaidItemsContext = createContext<RaidItemsContextType | null>(null)

export const RaidItemsProvider = ({ resetId, children, initialItems = [], isOpen, initialReservations, raidId }: { resetId: string, children: ReactNode, initialItems?: RaidItem[], isOpen: boolean, initialReservations: Reservation[], raidId: string }) => {
    //const [items, setItems] = useState<RaidItem[]>(initialItems)
    const [isReservationsOpen, setIsReservationsOpen] = useState<boolean>(isOpen)
    const { accessToken } = useAuth();
    const supabase = useMemo(() => createClientComponentClient(accessToken), [accessToken]);
    const repository = useMemo(() => new ReservationsRepository(supabase), [supabase]);
    const selectedCharacter = useCharacterStore(state => state.selectedCharacter);
    const [reserves, setReserves] = useState<Reservation[]>(initialReservations);
    const [maxReservations, setMaxReservations] = useState<number>(0);

    const yourReserves = useMemo(() => {
        return reserves?.filter((item: any) => item.member?.id === selectedCharacter?.id) || []
    }, [reserves, selectedCharacter]);

    const reservesByItem = useMemo(() => {
        return repository.groupByItem(reserves)
    }, [reserves, repository]);

    useQuery({
        queryKey: ['use-reservations-dynamic', resetId, selectedCharacter?.id, !!supabase],
        queryFn: async () => {
            const [reservedItems, totalReservations, isOpen] = await Promise.all([
                repository.fetchReservedItems(resetId),
                !selectedCharacter?.id ? Promise.resolve(0) : repository.fetchMaxReservations(resetId, selectedCharacter?.id),
                repository.getReserveOpenStatus(resetId),
            ]);
            setIsReservationsOpen(isOpen)
            setReserves(reservedItems)
            setMaxReservations(totalReservations)
            return reservedItems
        },
        enabled: !!resetId && !!supabase && !!selectedCharacter?.id,
        staleTime: 30000, // every 30 seconds in case realtime fails
    });

    const { data, isLoading, isPending } = useQuery({
        queryKey: ['use-reservations', resetId, selectedCharacter?.id],
        queryFn: async () => {

            const [isPresent, resetDays] = await Promise.all([
                selectedCharacter?.id ? repository.isUserPresentInReservations(resetId, selectedCharacter?.id) : Promise.resolve(false),
                repository.getResetDays(resetId)
            ])

            console.log('Fetched isPresent and resetDays:', { isPresent, resetDays });

            return { isPresent, resetDays }
        },
        staleTime: Infinity,
        enabled: !!resetId && !!supabase && !!selectedCharacter,
    });

    const { isPresent, resetDays } = useMemo(() => {
        return data ?? { isPresent: false, resetDays: [] }
    }, [data]);

    const { data: items, refetch } = useQuery({
        queryKey: ['raid-loot', resetId],
        queryFn: async () => {
            // Dummy query to enable refetching on raid loot change
            const items = await repository.getRaidItems(resetId, raidId);
            return items
        },
        staleTime: Infinity,
        enabled: !!resetId && !!supabase,
        initialData: initialItems,
    });

    useReservationsRealtime(
        resetId,
        async ({ new: newData, old }) => {
            console.log('Received reservations change via realtime for resetId:', resetId, { newData, old });
            if (newData.id) {
                // Upsert logic
                const exists = reserves.find(r => r.id === newData.id);
                if (!exists) {
                    console.log('Adding new reservation from realtime:', newData);
                    const reserves = await repository.fetchReservedItems(resetId);
                    setReserves(reserves);
                    return;
                }
            }

            if (old.id) {
                // Deletion logic
                const filtered = reserves.filter(r => r.id !== old.id);
                if (filtered.length !== reserves.length) { // only update if something was removed
                    console.log('Removing deleted reservation from realtime:', old);
                    setReserves(filtered);
                    return;
                }
            }
        },
        async () => {
            const isOpen = await repository.getReserveOpenStatus(resetId)
            setIsReservationsOpen(isOpen)
        },
        async () => {
            if (!selectedCharacter?.id) return setMaxReservations(0);
            const extraItems = await repository.fetchMaxReservations(resetId, selectedCharacter?.id)
            setMaxReservations(extraItems)
        },
        async (payload) => {
            // On Hard Reserve change
            refetch();
        },
        async (payload) => {
            // On Raid Loot change
            refetch();
        }
    )

    const reserveAudio = useMemo(() => {
        if (typeof Audio !== 'undefined') {
            const audio = new Audio('/sounds/LootCoinSmall.ogg');
            return audio;
        }
    }, []);

    const removeReserveAudio = useMemo(() => {
        if (typeof Audio !== 'undefined') {
            const audio = new Audio('/sounds/PutDownCloth_Leather01.ogg');
            return audio;
        }
    }, []);

    const maxReservationsAudio = useMemo(() => {
        if (typeof Audio !== 'undefined') {
            const audio = new Audio('/sounds/HumanMale_err_itemmaxcount01.ogg');
            return audio;
        }
    }, []);

    const reserve = useCallback(async (itemId: number, characterId = selectedCharacter?.id) => {
        if (!characterId || !supabase) return
        const item = items.find(({ id }) => id === itemId)
        if (!item) {
            console.error(`Item with id ${itemId} not found`)
            return
        }

        console.log('Reserve called for itemId:', itemId);

        // Create optimistic reservation
        const optimisticReservation: Reservation = {
            id: String(Math.random() * 1000000), // temporary id
            item: item,
            item_id: itemId,
            reset: {
                id: resetId,
                raid_date: '',
                name: '',
                min_lvl: 0,
                image_url: '',
                time: '',
                end_date: '',
                reservations_closed: false
            },
            member: {
                id: selectedCharacter?.id || 0,
                character: selectedCharacter! as unknown as Character,
            }
        }

        // Save previous state for rollback
        const previousReserves = reserves;

        // Optimistic update: Add reservation immediately
        setReserves([...reserves, optimisticReservation]);
        reserveAudio?.play().then().catch(console.error);

        try {
            console.log('Reserving item on server:', { itemId, characterId });
            const { isError, id } = await repository.reserveItem(resetId, itemId, characterId);

            if (isError) {
                // Rollback on error
                setReserves(previousReserves);
                maxReservationsAudio?.play().then().catch(console.error);
                toast.error(`Max reservations on reset or item reached`);
                return;
            }

            // Success
            setReserves(currentReserves => currentReserves.map(reservation => {
                if (reservation.id === optimisticReservation.id) {
                    return { ...reservation, id: id || reservation.id };
                }
                return reservation;
            }));


            if (!isPresent && selectedCharacter) {
                const className = (selectedCharacter?.playable_class?.name?.toLowerCase() ?? 'mage') as 'warrior' | 'paladin' | 'hunter' | 'rogue' | 'priest' | 'shaman' | 'mage' | 'warlock' | 'druid';

                registerOnRaid(selectedCharacter.id, resetId, {
                    days: resetDays,
                    role: selectedCharacter.selectedRole as MemberRole,
                    status: 'confirmed',
                    className
                }, supabase);
            }

            // Realtime will handle final synchronization with real data from DB
        } catch (error) {
            // Rollback on error
            console.error('Error reserving item, rolling back:', error);
            setReserves(previousReserves);
            toast.error('Error reserving item');
        }
    }, [resetId, supabase, items, isPresent, selectedCharacter, resetDays, reserves, repository, reserveAudio, maxReservationsAudio]);

    const remove = useCallback(async (reservationId: string) => {
        if (!selectedCharacter?.id || !supabase) return

        console.log('Remove called for reservationId:', reservationId);

        // Find the reservation to remove
        const reservationToRemove = reserves.find(
            reservation => reservation.id === reservationId && reservation.member?.id === selectedCharacter.id
        );

        if (!reservationToRemove) {
            console.error('No reservation found to remove for reservationId:', reservationId);
            return;
        }

        // Save previous state for rollback
        const previousReserves = reserves;

        // Optimistic update: Remove only the first matching reservation
        let removed = false;
        const optimisticReserves = reserves.filter(item => {
            if (!removed && item.id === reservationId && item.member?.id === selectedCharacter.id) {
                removed = true;
                return false;
            }
            return true;
        });

        // Update UI immediately
        setReserves(optimisticReserves);

        try {
            // Update DB
            const success = await repository.removeReservationById(reservationId);
            if (success) {
                removeReserveAudio?.play().then().catch(console.error);
            } else {
                // Rollback on failure
                setReserves(previousReserves);
                toast.error('Error removing reservation');
                return;
            }
            // Realtime will handle final synchronization
        } catch (error) {
            // Rollback on error
            console.error('Error removing reservation, rolling back:', error);
            setReserves(previousReserves);
            toast.error('Error removing reservation');
        }
    }, [resetId, supabase, reserves, selectedCharacter, removeReserveAudio, repository]);

    const toggleReservationsOpen = useCallback(async () => {
        const isOpen = await repository.toggleReservationOpen(resetId, isReservationsOpen)
        setIsReservationsOpen(isOpen)
    }, [resetId, isReservationsOpen, setIsReservationsOpen, repository]);

    const { yesNo } = useMessageBox();
    const hardReserve = useCallback(async (itemId: number) => {
        if (!selectedCharacter?.id || !supabase) return

        const confirm = await yesNo({
            title: 'Confirm Hard Reserve',
            message: 'Are you sure you want to hard reserve this item? This will remove all soft reserves for this item for participants.',
            yesText: 'Yes, hard reserve',
        });
        if (!confirm) return;

        const successHardReserve = await repository.hardReserveItem(resetId, itemId)
        if (!successHardReserve) {
            toast.error('Error hard reserving item')
            return
        }

        const successRemoveReserve = await repository.removeReservationsByItemAndResetId(itemId, resetId)
        if (!successRemoveReserve) {
            toast.error('Error removing soft reserve')
            const successRollbackHardReserve = await repository.removeHardReserveByResetIdAndItemId(resetId, itemId)
            if (!successRollbackHardReserve) {
                toast.error('Error rolling back hard reserve after soft reserve removal failure')
            }
            return
        }
        await refetch();
    }, [resetId, supabase, selectedCharacter, repository])

    const removeHardReserve = useCallback(async (itemId: number) => {
        if (!selectedCharacter?.id || !supabase) return
        const success = await repository.removeHardReserveByResetIdAndItemId(resetId, itemId)
        if (!success) {
            toast.error('Error removing hard reserve')
        } else {
            toast.success('Hard reserve removed')
            await refetch();
        }
    }, [resetId, supabase, selectedCharacter, repository])

    return (
        <RaidItemsContext.Provider value={{
            items,
            isReservationsOpen,
            setIsReservationsOpen,
            reserves,
            setReserves,
            maxReservations,
            setMaxReservations,
            yourReserves,
            reservesByItem,
            isLoading,
            isPending,
            isPresent,
            resetDays,
            reserve,
            remove,
            hardReserve,
            removeHardReserve,
            toggleReservationsOpen,
            repository,
        }}>
            {children}
        </RaidItemsContext.Provider>
    )
}

export const useRaidItems = () => {
    const context = useContext(RaidItemsContext)
    if (!context) throw new Error('useRaidItems must be used within RaidItemsProvider')
    return context
}