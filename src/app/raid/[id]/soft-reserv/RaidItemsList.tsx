'use client'

import {useEffect, useState} from "react";
import {Input} from "@nextui-org/react";
import {type RaidItem} from "@/app/raid/[id]/soft-reserv/types";
import SimpleListContainer from "@/app/raid/[id]/soft-reserv/SimpleListContainer";
import {useReservations} from "@/app/raid/[id]/soft-reserv/useReservations";
import {Reservation} from "@/app/raid/[id]/soft-reserv/types";
import {RaidItemCard} from "@/app/raid/[id]/soft-reserv/RaidItemCard";

const MAX_RESERVATIONS = 2

export default function RaidItemsList({items, initialReservedItems, resetId}: {
    items: RaidItem[],
    initialReservedItems: Reservation[],
    resetId: string
}) {
    const [filter, setFilter] = useState('')
    const [filteredItems, setFilteredItems] = useState(items)

    const {
        items: reservations,
        reserve,
        remove,
        yourReservations,
        reservationsByItem,
        isReservationsOpen
    } = useReservations(resetId, initialReservedItems)

    const filterItems = (items: RaidItem[], filter: string) => {
        return items.filter((item) => {
            return item.name.toLowerCase().includes(filter?.toLowerCase() ?? '')
        })
    }

    const updateFilteredItems = () => {
        setFilteredItems(filterItems(items, filter))
    }

    useEffect(() => {
        updateFilteredItems()
    }, [filter, reservations])
    const [isClicked, setIsClicked] = useState(0)
    useEffect(() => {
        console.log(isClicked)
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
            <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                label="Filter" id="filter" type="filter"/>
            <SimpleListContainer
                minus={100}
                className="flex gap-2 p-2 flex-wrap w-full"
            >
                {
                    filteredItems.map((item: RaidItem) => (
                        <RaidItemCard
                            key={item.id}
                            isClicked={isClicked === item.id}
                            setIsClicked={setIsClicked}
                            item={item}
                            reservedBy={reservationsByItem.find((r) => r.item.id === item.id)?.reservations}
                            remove={isReservationsOpen && yourReservations.find((r) => r.item.id === item.id) ? remove : undefined}
                            reserve={isReservationsOpen ? reserve : undefined}
                        />
                    ))
                }
            </SimpleListContainer>
        </div>
    )
}
