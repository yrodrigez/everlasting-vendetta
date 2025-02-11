'use client'
import {Reservation} from "@/app/raid/[id]/soft-reserv/types";
import {ReservedItem} from "@/app/raid/[id]/soft-reserv/ReservedItem";
import {useReservations} from "@/app/raid/[id]/soft-reserv/useReservations";
import {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLock, faLockOpen} from "@fortawesome/free-solid-svg-icons";
import {Tooltip} from "@heroui/react";

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
        items,
        maxReservations,
        globalLoading,
    } = useReservations(resetId, initialReservedItems)

    useEffect(() => {
        // it needs to be here to update the list of your reservations
        setStateReservations(yourReservations)
    }, [yourReservations, resetId])

    return <div className={"flex flex-col gap-2 relative w-full"}>
        {globalLoading && (
            <div className={
                `flex flex-col justify-center items-center p-2 rounded-md absolute top-0 left-0 w-full h-full bg-gray-400 z-50`
            }>
                <span className="text-gray-500 p-2 bg-white rounded">Loading...</span>
            </div>
        )}

        {!globalLoading && (
            <div className={
                `flex flex-col justify-center items-center absolute top-1 right-0 z-50 transition-all duration-300`
            }>
                {isReservationsOpen ? (
                    <FontAwesomeIcon icon={faLockOpen} className={`text-success transition-all`}/>
                ) : (
                    <Tooltip
                        content={'Reservations are closed'}
                        placement={'right'}
                    >
                        <FontAwesomeIcon icon={faLock} className="text-gray-500 transition-all"/>
                    </Tooltip>
                )}
            </div>
        )}

        <div className={
            `flex flex-col justify-between rounded-md`
        }>
            <h3 className="text-lg font-bold">Reserved items: {
                stateReservations.length
            } / {maxReservations}</h3>
        </div>
        <div className="flex gap-2 px-2 mb-8 grow flex-wrap overflow-auto max-h-24 scrollbar-pill">
            {
                stateReservations.length ? stateReservations.map((item) => (
                    <ReservedItem
                        showTooltip={false}
                        loading={loading}
                        reservationsOpen={isReservationsOpen}
                        belongsToLogged
                        remove={isReservationsOpen ? remove : undefined}
                        key={item.id}
                        reservation={item}
                    />
                )) : <span className="text-gray-500">None</span>
            }
        </div>
    </div>
}
