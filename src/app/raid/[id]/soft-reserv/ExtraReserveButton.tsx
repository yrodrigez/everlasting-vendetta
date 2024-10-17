import {Button} from "@/app/components/Button";
import {faMinus, faPlus, faSpinner, faUserPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {ModalBody, ModalContent, Modal, useDisclosure, ModalHeader, ModalFooter, Chip} from "@nextui-org/react";
import {useSession} from "@/app/hooks/useSession";
import {SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {useMutation, useQuery} from "@tanstack/react-query";
import Image from "next/image";
import React, {useCallback} from "react";
import Link from "next/link";
import {ExtraReserveActions} from "@/app/raid/[id]/soft-reserv/ExtraReserveActions";


async function fetchExtraReserves(resetId: string, supabase: SupabaseClient) {
    const {data: extraReserves, error} = await supabase
        .from('ev_extra_reservations')
        .select('character_id, extra_reservations')
        .eq('reset_id', resetId)
        .returns<{
            character_id: number;
            extra_reservations: number;
        }[]>()

    if (error) {
        console.error(error)
        return []
    }

    return (extraReserves ?? []).map((reserve) => {
        return {
            characterId: reserve.character_id,
            amount: reserve.extra_reservations
        }
    })
}


async function fetchResetMembers(resetId: string, supabase: SupabaseClient) {
    const {data: members, error} = await supabase
        .from('ev_raid_participant')
        .select('member:ev_member(*), details')
        .eq('raid_id', resetId)
        .order('created_at', {ascending: true})
        .returns<{
            details: {
                status: string;
                role: string;
            };
            member: {
                id: number;
                character: {
                    name: string;
                    level: number;
                    id: number;
                    avatar: string;
                    guild: {
                        name: string;
                    }
                }
            }
        }[]>()

    if (error) {
        return []
    }

    return members ?? []
}


export function ExtraReserveButton({resetId}: { resetId: string }) {
    const {isOpen, onOpen, onOpenChange,} = useDisclosure()
    const {supabase,} = useSession()

    const getStatusChip = useCallback((status: string) => {
        const color = ((status: string) => {
            switch (status) {
                case 'confirmed':
                    return 'success'
                case 'tentative':
                    return 'secondary'
                case 'declined':
                    return 'danger'
                default:
                    return 'warning'
            }
        })(status);
        return (
            <Chip className={`capitalize min-w-20 text-${color}`} color={color}
                  size="sm"
                  variant="flat"

            >
                {status}
            </Chip>
        );

    }, [])

    const {data: members, error, isFetching, refetch: reFetchMembers} = useQuery(
        {
            queryKey: ['resetMembers', resetId],
            enabled: supabase !== undefined,
            queryFn: () => {
                if (supabase) {
                    return fetchResetMembers(resetId, supabase)
                }

                return []
            },
        });

    const {data: extraReserves, isFetching: isFetchingReserves, refetch: reFetchReserves,} = useQuery(
        {
            queryKey: ['extraReserves', resetId],
            enabled: supabase !== undefined,
            queryFn: () => {
                if (supabase) {
                    return fetchExtraReserves(resetId, supabase)
                }

                return []
            },
        });
    return (
        <>
            <Button
                isIconOnly
                size="lg"
                onClick={onOpen}
                isLoading={isFetching || isFetchingReserves}
                isDisabled={isFetching || isFetchingReserves}
            >
                <FontAwesomeIcon icon={faUserPlus}/>
            </Button>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                scrollBehavior="inside"
                size="xl"
                className="scrollbar-pill bg-dark border border-gold"
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader>
                                <h1
                                    className="text-center text-gold text-2xl"
                                >Add extra reserve</h1>
                            </ModalHeader>
                            <ModalBody>
                                {members?.map((participation) => {
                                    const characterExtraReserve = extraReserves?.find((reserve) => reserve.characterId === participation.member.id)
                                    const currentAmount = characterExtraReserve?.amount ?? 0
                                    return (
                                        <div key={participation.member.id}
                                             className="grid grid-cols-3 gap-2 p-2 text-center"
                                        >
                                            <div className="flex gap-2">
                                                <Image src={participation.member.character.avatar}
                                                       alt={participation.member.character.name} width={32} height={24}
                                                       className="rounded-lg border border-gold"/>
                                                <Link
                                                    className="self-end"
                                                    href={`/roster/${participation.member.character.name.toLowerCase()}`}
                                                    target="_blank">
                                                    {participation.member.character.name}
                                                </Link>
                                            </div>
                                            <div className="flex items-center">
                                                {getStatusChip(participation.details.status)}
                                            </div>
                                            <div className="w-36 h-9 flex items-center">
                                                <ExtraReserveActions
                                                    resetId={resetId}
                                                    currentAmount={currentAmount}
                                                    participation={participation}
                                                    supabase={supabase}
                                                    options={{
                                                        onExtraReserveUpdate: [reFetchReserves, reFetchMembers]
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </ModalBody>
                            <ModalFooter></ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}
