'use client'
import {useEffect, useState} from "react";
import {type RaidItem} from "@/app/raid/[id]/soft-reserv/types";
import SimpleListContainer from "@/app/raid/[id]/soft-reserv/SimpleListContainer";
import {useReservations} from "@/app/raid/[id]/soft-reserv/useReservations";
import {Reservation} from "@/app/raid/[id]/soft-reserv/types";
import {RaidItemCard} from "@/app/raid/[id]/soft-reserv/RaidItemCard";
import {Filters} from "@/app/raid/[id]/soft-reserv/Filters";
import {useFiltersStore} from "@/app/raid/[id]/soft-reserv/filtersStore";
import {Button} from "@nextui-org/react";

const MAX_RESERVATIONS = 2

export default function RaidItemsList({items, initialReservedItems, resetId}: {
    items: RaidItem[],
    initialReservedItems: Reservation[],
    resetId: string
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
        isReservationsOpen
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
                console.log(itemSubClassFilter, item.itemSubclass)
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
                console.log(qualityName, qualityNameFilter)
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

    return (
        <div className="flex flex-col gap-3 w-full">
            <Filters

            />
            <SimpleListContainer
                minus={332}
                className="flex gap-2 p-2 flex-wrap w-full"
            >
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
                    />
                ))}
            </SimpleListContainer>
        </div>
    )
}
