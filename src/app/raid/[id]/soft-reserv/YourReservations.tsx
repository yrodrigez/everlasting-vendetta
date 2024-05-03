'use client'
import {Reservation} from "@/app/raid/[id]/soft-reserv/types";
import {ReservedItem} from "@/app/raid/[id]/soft-reserv/ReservedItem";
import {useReservations} from "@/app/raid/[id]/soft-reserv/useReservations";
import {useEffect, useState} from "react";

export default function YourReservations({resetId, initialReservedItems}: {
    resetId: string,
    initialReservedItems: Reservation[]
}) {
    const [stateReservations, setStateReservations] = useState<Reservation[]>([])
    const {
        remove,
        loading,
        yourReservations,
        isReservationsOpen,
        items
    } = useReservations(resetId, initialReservedItems)
    useEffect(() => {
        // it needs to be here to update the list of your reservations
        setStateReservations(yourReservations)
    }, [yourReservations])
    return <div
        className={"flex flex-col gap-2 p-2 relative w-full h-full"}
    >
        {!isReservationsOpen && (
            <div className={
                `flex flex-col justify-center items-center p-2 rounded-md absolute top-0 left-0 w-full h-full bg-gray-400 bg-opacity-50 z-50`
            }>
                <span className="text-gray-500 p-2 bg-white rounded">Reservations are closed</span>
            </div>
        )
        }

        <div className={
            `flex flex-col justify-between p-2 rounded-md`
        }>
            <h3 className="text-lg font-bold">Your reserved items:</h3>
        </div>
        <div className="flex gap-2 px-2">
            {stateReservations.length ? stateReservations.map((item) => (
                <ReservedItem
                    showTooltip={false}
                    loading={loading}
                    reservationsOpen={isReservationsOpen}
                    belongsToLogged
                    remove={isReservationsOpen ? remove : undefined}
                    key={item.id}
                    reservation={item}
                />
            )) : <span
                className="text-gray-500">None</span>}
        </div>
        {items.length > 0 && <div>
          <h3 className="text-lg font-bold">Reserved items total: {
              items.length
          }</h3>
          <h3 className="text-lg font-bold">Reserved items (you): {
              stateReservations.length
          }</h3>
          <h3 className="text-lg font-bold">Reserved items left: {
              2 - stateReservations.length
          }</h3>
        </div>
        }
    </div>
}
