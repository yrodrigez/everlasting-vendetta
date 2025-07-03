'use client'
import {Button} from "@/app/components/Button";
import {useMutation} from "@tanstack/react-query";
import {useSession} from "@hooks/useSession";
import {useMessageBox} from "@utils/msgBox";
import {useRouter} from "next/navigation";
import {useEffect, useRef} from "react";

export default function CloneReservesCard({originalResetId, reset, reserves}: {
    originalResetId: string,
    reset: { id: string, image: string, name: string, date: string },
    reserves: { member_id: number, item_id: number }[]
}) {

    const {supabase} = useSession()
    const {yesNo, alert} = useMessageBox()
    const router = useRouter()
    const refTimeout = useRef<NodeJS.Timeout | null>(null)

    const {isPending, mutate} = useMutation({
        mutationKey: ['clone-reserves'],
        mutationFn: async () => {
            // Perform the clone operation here
            if (!supabase) {
                return false
            }

            const response = await yesNo({
                title: 'Clone Raid Reserves',
                message: 'Are you sure you want to clone the raid reserves? This will delete current reserves and clone from the selected reset.',
                yesText: 'Clone',
                noText: 'Cancel',
            })

            if (response === 'no') {
                return false
            }

            const {error: deletionError} = await supabase
                .from('raid_loot_reservation')
                .delete()
                .eq('reset_id', originalResetId)

            if (deletionError) {
                alert({
                    title: 'Error',
                    message: 'Failed to delete current reserves. Please try again.',
                    type: 'error',
                })
                console.error('Error deleting current reserves:', deletionError)
                return false
            }

            const {error: cloneError} = await supabase
                .from('raid_loot_reservation')
                .insert(reserves.map((reserve) => ({
                    ...reserve,
                    reset_id: originalResetId,
                })))

            if (cloneError) {
                alert({
                    title: 'Error',
                    message: 'Failed to clone reserves. Please try again.',
                    type: 'error',
                })
                console.error('Error cloning reserves:', cloneError)
                return false
            }

            alert({
                title: 'Success',
                message: 'Raid reserves cloned successfully.',
                type: 'success',
            })

            refTimeout.current = setTimeout(() => {
                router.back()
            }, 5000)
            return true
        },

    })

    useEffect(() => {
        return () => {
            if (refTimeout.current) {
                clearTimeout(refTimeout.current)
            }
        }
    }, [])

    return (
        <div
            className="relative group w-[300px] h-[256px] rounded-md border border-wood-100 bg-wood-900 backdrop-blur p-3 flex flex-col items-center justify-center overflow-hidden"
            style={{
                backgroundImage: `url('/${reset.image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div
                className="absolute inset-0 bg-black opacity-30 group-hover:opacity-70 transition-opacity duration-300"/>

            <div
                className="absolute inset-0 flex flex-col  justify-between text-white z-10 p-3 rounded-md"
            >
                <div>
                    <h2 className="text-xl font-semibold text-gold">
                        {reset.name}
                    </h2>
                    <span className="text-sm text-default">
                        {new Date(reset.date).toLocaleDateString()}
                    </span>
                </div>
                <Button
                    className="mt-2 font-bold"
                    isDisabled={isPending || !supabase}
                    onPress={() => {
                        // Handle clone action
                        mutate()
                    }}
                >
                    Clone
                </Button>
                <div className="flex gap-3">
                    {reserves.length} reservations
                </div>
            </div>
        </div>
    )
}