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
    const {remove, loading, yourReservations, isReservationsOpen} = useReservations(resetId, initialReservedItems)
    useEffect(() => {
        // it needs to be here to update the list of your reservations
        setStateReservations(yourReservations)
    }, [yourReservations])
    return <div
        className={"flex flex-col gap-2 p-2"}
    >
        <div className={
            `flex items-center justify-between p-2 rounded-md`
        }>
            <h3 className="text-lg font-bold">Your reserved items:</h3>
            {!isReservationsOpen && <span
              className="text-gray-500">Reservations are closed</span>
            }
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
    </div>
}
