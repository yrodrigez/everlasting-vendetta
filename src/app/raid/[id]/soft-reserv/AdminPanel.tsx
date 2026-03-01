'use client'
import { Tooltip } from "@heroui/react";
import { useReservations } from "@/app/raid/[id]/soft-reserv/useReservations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";
import { ExportToGargul } from "@/app/raid/[id]/soft-reserv/ExportToGargul";
import { ShowReservations } from "@/app/raid/[id]/soft-reserv/ShowReservations";
import ShowReserveRules from "@/app/raid/[id]/soft-reserv/ShowReserveRules";
import { Button } from "@/app/components/Button";
import { ReserveForOthers } from "@/app/raid/[id]/soft-reserv/ReserveForOthers";
import { ExtraReserveButton } from "@/app/raid/[id]/soft-reserv/ExtraReserveButton";
import { AddItem } from "@/app/raid/[id]/soft-reserv/AddItem";
import CloneReserves from "@/app/raid/[id]/soft-reserv/CloneReserves";

export default function AdminPanel({ isAdmin, resetId, realmSlug }: { isAdmin: boolean, resetId: string, realmSlug: string }) {
    const { isReservationsOpen, setIsReservationsOpen, reservationsByItem, items, loading } = useReservations(resetId)

    return (
        <div className="flex lg:flex-col gap-2 w-full overflow-x-auto lg:overflow-visible pt-2 lg:pt-0">
            <Tooltip
                content={'Back to raid'}
                placement={'right'}
            >
                <Button
                    as="a"
                    href={`/raid/${resetId}`}
                    className={'bg-moss text-gold rounded'}
                    size={'lg'}
                    isIconOnly>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </Button>
            </Tooltip>
            <ShowReserveRules />
            <Tooltip
                content={isAdmin ? (isReservationsOpen ? 'Close reservations' : 'Open reservations') : isReservationsOpen ? 'Reservations are open' : 'Reservations are closed'}
                placement={'right'}
            >
                <div>
                    <Button
                        onPress={setIsReservationsOpen}
                        disabled={!isAdmin}
                        isDisabled={!isAdmin}
                        size={'lg'}
                        isIconOnly>
                        <FontAwesomeIcon icon={isReservationsOpen ? faLockOpen : faLock} />
                    </Button>
                </div>
            </Tooltip>
            <ExportToGargul
                loading={loading}
                reservationsByItem={reservationsByItem}
                isReservationsOpen={isReservationsOpen}
                resetId={resetId}
            />
            <ShowReservations items={items} isAdmin={isAdmin} realmSlug={realmSlug} />
            {
                isAdmin && (<>
                    <ReserveForOthers resetId={resetId} realmSlug={realmSlug} />
                    <ExtraReserveButton resetId={resetId} realmSlug={realmSlug} />
                    <AddItem resetId={resetId} />
                    <CloneReserves resetId={resetId} />
                </>)
            }
        </div>
    )
}
