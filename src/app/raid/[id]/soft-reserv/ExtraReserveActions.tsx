import {Button} from "@/app/components/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMinus, faPlus} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import {useMutation} from "@tanstack/react-query";
import {SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {Spinner} from "@nextui-org/react";

async function updateExtraReserve(resetId: string, characterId: number, amount: number, supabase?: SupabaseClient) {
    if (!supabase) {
        return false
    }

    const {error} = await supabase
        .from('ev_extra_reservations')
        .upsert({
            reset_id: resetId,
            character_id: characterId,
            extra_reservations: amount
        }, {
            onConflict: 'character_id,reset_id'
        })


    if (error) {
        console.error(error)
    }

    return (error === undefined || error === null)
}

export function ExtraReserveActions({currentAmount, participation, resetId, supabase, options}: {
    currentAmount: number,
    participation: any,
    resetId: string,
    supabase?: any,
    options?: {
        onExtraReserveUpdate?: Array<Function>
    }
}) {


    const {
        isPending: updatingReserve,
        mutate: extraReserve
    } = useMutation({
        mutationKey: ['updateExtraReserve', participation.member.id],
        mutationFn: ({characterId, amount}: {
            characterId: number,
            amount: number
        }) => updateExtraReserve(resetId, characterId, amount, supabase),
        onSuccess: async () => {
            if (options?.onExtraReserveUpdate) {
                options.onExtraReserveUpdate.forEach((fn) => fn())
            }
        }
    })

    return (
        <>
            <Button
                size="sm"
                variant="light"
                className="bg-moss text-default rounded-lt-none rounded-rt-none"
                isIconOnly
                isDisabled={updatingReserve}
                onClick={() => {
                    extraReserve({
                        characterId: participation.member.id,
                        amount: currentAmount - 1
                    })
                }}
            >
                <FontAwesomeIcon icon={faMinus}/>
            </Button>
            <span
                className="flex items-center justify-center w-8">{currentAmount}</span>
            <div
                className="flex items-center gap-2"
            >
                <Button
                    size="sm"
                    variant="light"
                    className="bg-moss text-default rounded-lt-none rounded-rt-none "
                    isIconOnly
                    isDisabled={updatingReserve}
                    onClick={() => {
                        extraReserve({
                            characterId: participation.member.id,
                            amount: currentAmount + 1
                        })
                    }}
                >
                    <FontAwesomeIcon icon={faPlus}/>
                </Button>
                {
                    updatingReserve && <Spinner size='sm' />
                }
            </div>
        </>
    )
}
