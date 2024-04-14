'use client'

import  {useEffect, useState} from "react";
import {Input} from "@nextui-org/react";
import RaidItem from "@/app/calendar/components/RaidItem";
import {useReservationsStore} from "@/app/calendar/components/reservationStore";
import SimpleListContainer from "@/app/calendar/components/SimpleListContainer";

export type RaidItem = {
    id: number;
    name: string;
    description: any;
    image: string;
    raid: string;
    minLevel: number;
}
export default function RaidItemsList({items}: { items: RaidItem[] }) {
    const [filter, setFilter] = useState('')
    const [filteredItems, setFilteredItems] = useState(items)
    const reservedItems = useReservationsStore(state => state.items)

    const filterItems = (items: RaidItem[], filter: string) => {
        return items.filter((item) => {
            return item.name.toLowerCase().includes(filter.toLowerCase()) && !reservedItems.find(x => x.id === item.id)
        })
    }

    const updateFilteredItems = () => {
        setFilteredItems(filterItems(items, filter))
    }

    useEffect(() => {
        updateFilteredItems()
    }, [filter, reservedItems])

    return (
        <div className="flex flex-col gap-3 w-full">
            <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                label="Filter" id="filter" type="filter"/>
            <SimpleListContainer>
                {
                    filteredItems.map((item: RaidItem) => (
                        <RaidItem key={item.id} item={item}/>
                    ))
                }
            </SimpleListContainer>
        </div>
    )
}
