'use client'

import {Button, Tooltip} from "@nextui-org/react";
import {useReservations} from "@/app/raid/[id]/soft-reserv/useReservations";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft, faBackward, faLock, faLockOpen} from "@fortawesome/free-solid-svg-icons";
import {ExportToGargul} from "@/app/raid/[id]/soft-reserv/ExportToGargul";
import {ShowReservations} from "@/app/raid/[id]/soft-reserv/ShowReservations";
import Link from "next/link";

export default function AdminPanel({isAdmin, resetId}: { isAdmin: boolean, resetId: string }) {
    const {isReservationsOpen, setIsReservationsOpen, reservationsByItem, items} = useReservations(resetId)
    return (
        <div
            className={'flex flex-col gap-2'}
        >
            <Link href={`/raid/${resetId}`}>
                <Tooltip
                    content={'Back to raid'}
                    placement={'right'}
                >
                    <Button
                        className={'bg-moss text-gold'}
                        size={'lg'}
                        variant={'light'}
                        isIconOnly>
                        <FontAwesomeIcon icon={faArrowLeft}/>
                    </Button>
                </Tooltip>
            </Link>
            <Tooltip
                content={isAdmin ? (isReservationsOpen ? 'Close reservations' : 'Open reservations') : isReservationsOpen ? 'Reservations are open' : 'Reservations are closed'}
                placement={'right'}
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
            <ExportToGargul
                reservationsByItem={reservationsByItem}
                isReservationsOpen={isReservationsOpen}
            />
            {(isAdmin || !isReservationsOpen) ? <ShowReservations items={items}/> : null}
        </div>
    )
}
