'use client'
import {Tooltip} from "@nextui-org/react";
import {useReservations} from "@/app/raid/[id]/soft-reserv/useReservations";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft, faLock, faLockOpen, faUserTie} from "@fortawesome/free-solid-svg-icons";
import {ExportToGargul} from "@/app/raid/[id]/soft-reserv/ExportToGargul";
import {ShowReservations} from "@/app/raid/[id]/soft-reserv/ShowReservations";
import Link from "next/link";
import ShowReserveRules from "@/app/raid/[id]/soft-reserv/ShowReserveRules";
import {Button} from "@/app/components/Button";
import {ReserveForOthers} from "@/app/raid/[id]/soft-reserv/ReserveForOthers";

export default function AdminPanel({isAdmin, resetId}: { isAdmin: boolean, resetId: string }) {
    const {isReservationsOpen, setIsReservationsOpen, reservationsByItem, items, loading} = useReservations(resetId)

    return (
        <div className="flex flex-col gap-2">
            <Tooltip
                content={'Back to raid'}
                placement={'right'}
            >
                <Link href={`/raid/${resetId}`}>
                    <Button
                        className={'bg-moss text-gold rounded'}
                        size={'lg'}
                        variant={'light'}
                        isIconOnly>
                        <FontAwesomeIcon icon={faArrowLeft}/>
                    </Button>
                </Link>
            </Tooltip>
            <ShowReserveRules/>
            <Tooltip
                content={isAdmin ? (isReservationsOpen ? 'Close reservations' : 'Open reservations') : isReservationsOpen ? 'Reservations are open' : 'Reservations are closed'}
                placement={'right'}
            >
                <div>
                    <Button
                        onClick={setIsReservationsOpen}
                        disabled={!isAdmin}
                        isDisabled={!isAdmin}
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
            <ShowReservations items={items} isAdmin={isAdmin}/>
            {isAdmin && <ReserveForOthers resetId={resetId}/>}
        </div>
    )
}
