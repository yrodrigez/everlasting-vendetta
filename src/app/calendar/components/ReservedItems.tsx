'use client'
import {useReservationsStore} from "@/app/calendar/components/reservationStore";
import SimpleListContainer from "@/app/calendar/components/SimpleListContainer";
import RaidItem from "@/app/calendar/components/RaidItem";
import {Button} from "@nextui-org/react";

export default function ReservedItems() {
    const reservedItems = useReservationsStore(state => state.items)
    const clearItems = useReservationsStore(state => state.clearItems)
    return (
        <div className="
         h-full w-full
        ">
            <h2 className="text-2xl font-bold">Reserved Items</h2>
            <SimpleListContainer minus={600}>
                {reservedItems.map((item) => (<RaidItem key={item.id} item={item}/>))}
            </SimpleListContainer>
            {reservedItems.length ? <div className={
                "flex justify-between w-full gap-4 mt-4"
            }>
                <Button
                    onClick={clearItems}
                    className="bg-red-500 text-white"
                >
                    Clear
                </Button>
                <Button
                    className="bg-moss border-gold text-gold border-1"
                >
                    Reserve
                </Button>
            </div> : null}
        </div>
    )
}
