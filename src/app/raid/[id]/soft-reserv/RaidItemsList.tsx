'use client'
import { Filters } from "@/app/raid/[id]/soft-reserv/Filters";
import { useFiltersStore } from "@/app/raid/[id]/soft-reserv/filtersStore";
import { RaidItemCard } from "@/app/raid/[id]/soft-reserv/RaidItemCard";
import { type RaidItem, Reservation } from "@/app/raid/[id]/soft-reserv/types";
import { useReservations } from "@/app/raid/[id]/soft-reserv/useReservations";
import { Button, ScrollShadow } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/shallow";
import { useRaidItems } from "./raid-items-context";

function BossHeader({ boss }: { boss: { name: string, avatar_url?: string, info_url?: string } | null }) {
    const bossName = boss?.name
    if(!bossName) return null
    return (
        <div className="flex items-center gap-3 mb-3 p-2 w-full">
            <div className="flex flex-col">
                <span className="text-gold font-bold text-lg">{bossName}</span>
            </div>
        </div>
    )
}

export default function RaidItemsList({ initialReservedItems, resetId, isAdmin }: {
    initialReservedItems: Reservation[],
    resetId: string
    isAdmin: boolean
}) {
    const { items } = useRaidItems()
    const [filteredItems, setFilteredItems] = useState(items)
    const {
        name: nameFilter,
        itemClass: itemClassFilter,
        itemSubClass: itemSubClassFilter,
        inventoryType: inventoryTypeFilter,
        qualityName: qualityNameFilter,
        clearFilters,
    } = useFiltersStore(useShallow(state => ({
        name: state.name,
        itemClass: state.itemClass,
        itemSubClass: state.itemSubClass,
        inventoryType: state.inventoryType,
        qualityName: state.qualityName,
        clearFilters: state.clear
    })))

    const {
        items: reservations,
        reserve,
        remove,
        yourReservations,
        reservationsByItem,
        isReservationsOpen,
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
            filteredItems = filteredItems.filter(({ description: item }) => {
                if (!itemClassFilter || itemClassFilter?.length === 0) return true

                return itemClassFilter.map((itemClass) => itemClass.toLowerCase()).includes(item.itemClass.toLowerCase())
            })
        }
        if (!!itemSubClassFilter) {
            filteredItems = filteredItems.filter(({ description: item }) => {
                if (!itemSubClassFilter || itemSubClassFilter?.length === 0) return true
                return itemSubClassFilter.map((itemSubClass) => itemSubClass?.toLowerCase()).includes(item.itemSubclass?.toLowerCase())
            })
        }

        if (!!inventoryTypeFilter) {
            filteredItems = filteredItems.filter(({ description: item }) => {
                if (!inventoryTypeFilter || inventoryTypeFilter.length === 0) return true

                return inventoryTypeFilter.map((inventoryType) => inventoryType.toLowerCase()).includes(item.inventoryType.toLowerCase())
            })
        }

        if (!!qualityNameFilter) {
            filteredItems = filteredItems.filter(({ description: item }) => {
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
        if (!Audio) return
        const openStore = new Audio('/sounds/AuctionWindowOpen.ogg')
        openStore.play().then(() => {
        }).catch((reason) => {
            console.error(reason)
        })
    }, []);

    const groupedByBoss = useMemo<{
        [bossName: string]: RaidItem[]
    }>(() => {
        return filteredItems.reduce((acc, item) => {
            const bossName = item?.boss?.name || ''
            if (!acc[bossName]) {
                acc[bossName] = []
            }
            acc[bossName].push(item)
            return acc
        }, {} as { [bossName: string]: RaidItem[] })
    }, [filteredItems])


    return (
        <div className="flex flex-col gap-3 w-full overflow-auto lg:overflow-visible max-h-full flex-1 pt-2 lg:pt-0">
            <Filters />
            <ScrollShadow
                className="flex flex-col gap-4 p-2 w-full h-full overflow-auto scrollbar-pill">
                {filteredItems.length === 0 && <div className="text-center w-full h-full flex flex-col items-center ">
                    <span>No items found. Try removing some filters!</span>
                    <Button
                        onPress={clearFilters}
                        size={'lg'}
                        className="mt-2 bg-dark text-gold rounded border border-dark-100 font-bold"
                    >
                        Clear filters
                    </Button>
                </div>}
                {Object.entries(groupedByBoss).sort(([a], [b]) => {
                    if(a === 'Trash') return 1
                    if(b === 'Trash') return -1
                    return a.localeCompare(b)
                }).map(([bossName, bossItems]) => {
                    const boss = bossItems[0]?.boss || null
                    return (
                        <div key={bossName} className="w-full">
                            <BossHeader boss={boss} />
                            <div className="flex gap-2 flex-wrap justify-center lg:justify-start">
                                {bossItems.map((item: RaidItem) => {
                                    const toRemove = yourReservations?.find(r => r.item.id === item.id)
                                    return (
                                        <RaidItemCard
                                            key={item.id}
                                            isClicked={isClicked === item.id}
                                            setIsClicked={setIsClicked}
                                            item={item}
                                            reservedBy={reservationsByItem.find((r) => r.item.id === item.id)?.reservations}
                                            remove={toRemove && (async () => {
                                                if (toRemove) {
                                                    remove(toRemove.id)
                                                }
                                            })}
                                            reserve={isReservationsOpen ? reserve : undefined}
                                            hardReserve={isAdmin ? hardReserve : undefined}
                                            removeHardReserve={isAdmin ? removeHardReserve : undefined}
                                            isLoading={loading}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </ScrollShadow>
        </div>
    )
}
