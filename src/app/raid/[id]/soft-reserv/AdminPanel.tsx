'use client'

import {Button, Tooltip} from "@nextui-org/react";
import {useReservations} from "@/app/raid/[id]/soft-reserv/useReservations";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLock, faLockOpen} from "@fortawesome/free-solid-svg-icons";

export default function AdminPanel({isAdmin, resetId}: { isAdmin: boolean, resetId: string }) {
    const {isReservationsOpen, setIsReservationsOpen} = useReservations(resetId)
    return (
        <Tooltip
            content={isAdmin ? (isReservationsOpen ? 'Close reservations' : 'Open reservations') : isReservationsOpen ? 'Reservations are open' : 'Reservations are closed'}
            placement={'top'}
        >
            <div>
                <Button
                    onClick={setIsReservationsOpen}
                    disabled={!isAdmin}
                    isDisabled={!isAdmin}
                    className={'bg-moss text-gold'}
                    size={'lg'}
                    variant={'light'}
                    isIconOnly>
                    <FontAwesomeIcon icon={isReservationsOpen ? faLockOpen : faLock}/>
                </Button>
            </div>
        </Tooltip>
    )
}
