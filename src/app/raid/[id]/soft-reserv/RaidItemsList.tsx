'use client'
import {useEffect, useState} from "react";
import {type RaidItem, Reservation} from "@/app/raid/[id]/soft-reserv/types";
import {useReservations} from "@/app/raid/[id]/soft-reserv/useReservations";
import {RaidItemCard} from "@/app/raid/[id]/soft-reserv/RaidItemCard";
import {Filters} from "@/app/raid/[id]/soft-reserv/Filters";
import {useFiltersStore} from "@/app/raid/[id]/soft-reserv/filtersStore";
import {Button, ScrollShadow} from "@nextui-org/react";
import {useRouter} from "next/navigation";

export default function RaidItemsList({items, initialReservedItems, resetId, isAdmin}: {
    items: RaidItem[],
    initialReservedItems: Reservation[],
    resetId: string
    isAdmin: boolean
}) {

    const [filteredItems, setFilteredItems] = useState(items)
    const {
        name: nameFilter,
        itemClass: itemClassFilter,
        itemSubClass: itemSubClassFilter,
        inventoryType: inventoryTypeFilter,
        qualityName: qualityNameFilter,
        clear: clearFilters,
    } = useFiltersStore()

    const {
        items: reservations,
        reserve,
        remove,
        yourReservations,
        reservationsByItem,
        isReservationsOpen,
        supabase,
        hardReserve,
        removeHardReserve,
        loading,
    } = useReservations(resetId, initialReservedItems)

    const filterItems = (items: RaidItem[]) => {
        let filteredItems = [...items]
        if (!!nameFilter) {
            // @ts-ignore - name is a string and includes is a string method
            filteredItems = filteredItems.filter((item) => item.name.toLowerCase().includes(nameFilter.toLowerCase()))
        }
        if (!!itemClassFilter) {
            filteredItems = filteredItems.filter(({description: item}) => {
                if (!itemClassFilter || itemClassFilter?.length === 0) return true

                return itemClassFilter.map((itemClass) => itemClass.toLowerCase()).includes(item.itemClass.toLowerCase())
            })
        }
        if (!!itemSubClassFilter) {
            filteredItems = filteredItems.filter(({description: item}) => {
                if (!itemSubClassFilter || itemSubClassFilter?.length === 0) return true
                return itemSubClassFilter.map((itemSubClass) => itemSubClass?.toLowerCase()).includes(item.itemSubclass?.toLowerCase())
            })
        }

        if (!!inventoryTypeFilter) {
            filteredItems = filteredItems.filter(({description: item}) => {
                if (!inventoryTypeFilter || inventoryTypeFilter.length === 0) return true

                return inventoryTypeFilter.map((inventoryType) => inventoryType.toLowerCase()).includes(item.inventoryType.toLowerCase())
            })
        }

        if (!!qualityNameFilter) {
            filteredItems = filteredItems.filter(({description: item}) => {
                if (!qualityNameFilter || qualityNameFilter.length === 0) return true
                const qualityName = ['Poor', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary',][item.quality ?? 0]
                return qualityNameFilter.includes(qualityName)
            })
        }

        return filteredItems
    }

    const updateFilteredItems = () => {
        setFilteredItems(filterItems(items))
    }

    useEffect(() => {
        updateFilteredItems()
    }, [reservations, nameFilter, itemClassFilter, itemSubClassFilter, inventoryTypeFilter, qualityNameFilter, items])

    const [isClicked, setIsClicked] = useState(0)
    useEffect(() => {
        updateFilteredItems()
    }, [isClicked]);

    useEffect(() => {
        const openStore = new Audio('/sounds/AuctionWindowOpen.ogg')
        openStore.play().then(() => {
        }).catch((reason) => {
            console.error(reason)
        })
    }, []);

    const router = useRouter()
    useEffect(() => {
        if(!supabase) return
        const isOpenChannel = supabase.channel(`raid_loot:id=eq.${resetId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'raid_loot',
            }, async () => {
                router.refresh()
            }).subscribe()

        const hardReserveChannel = supabase.channel(`hard_reserve:reset_id=eq.${resetId}`)
            .on('postgres_changes',{
                event: '*',
                schema: 'public',
                table: 'reset_hard_reserve',
                filter: 'reset_id=eq.' + resetId
            }, async () => {
                router.refresh()
            }).subscribe()

        return () => {
            isOpenChannel.unsubscribe()
            hardReserveChannel.unsubscribe()
        }
    }, [supabase, resetId]);

    return (
        <div className="flex flex-col gap-3 w-full overflow-auto lg:overflow-visible max-h-full flex-1 pt-2 lg:pt-0">
            <Filters/>
            <ScrollShadow
                className="flex gap-2 p-2 flex-wrap w-full h-full overflow-auto scrollbar-pill justify-center items-center lg:justify-start lg:items-start">
                {filteredItems.length === 0 && <div className="text-center w-full h-full flex flex-col items-center ">
                  <span>No items found. Try removing some filters!</span>
                  <Button
                    onClick={clearFilters}
                    size={'lg'}
                    className="mt-2 bg-dark text-gold rounded border border-dark-100 font-bold"
                  >
                    Clear filters
                  </Button>
                </div>}
                {filteredItems.map((item: RaidItem) => (
                    <RaidItemCard
                        key={item.id}
                        isClicked={isClicked === item.id}
                        setIsClicked={setIsClicked}
                        item={item}
                        reservedBy={reservationsByItem.find((r) => r.item.id === item.id)?.reservations}
                        remove={isReservationsOpen && yourReservations.find((r) => r.item.id === item.id) ? remove : undefined}
                        reserve={isReservationsOpen ? reserve : undefined}
                        hardReserve={isAdmin ? hardReserve : undefined}
                        removeHardReserve={isAdmin ? removeHardReserve: undefined}
                        isLoading={loading}
                    />
                ))}
            </ScrollShadow>
        </div>
    )
}
