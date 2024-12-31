'use client'
import {getQualityColor} from "@/app/util";
import Link from "next/link";
import {useReservations} from "@/app/raid/[id]/soft-reserv/useReservations";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClose} from "@fortawesome/free-solid-svg-icons";
import {ScrollShadow} from "@nextui-org/react";
import {Button} from "@/app/components/Button";
import {useCallback, useState} from "react";

export function BannedItems({hardReservations, reset_id, isAdmin = false, raid_id}: {
    hardReservations: any,
    reset_id: string,
    isAdmin?: boolean
    raid_id: string
}) {
    const {removeHardReserve, loading, globalLoading, supabase} = useReservations(reset_id, [])

    const [updateLoading, setUpdateLoading] = useState(false)

    const updateFutureRaids = useCallback(async () => {
        if (!supabase || !reset_id || !raid_id) return
        if (updateLoading) return
        setUpdateLoading(true)
        const accept = confirm('Are you sure you want to update future raids? This will update all the future raids with the current banned items and update the template for the future raids.')
        if (!accept) return

        const {data: futureResets, error: futureResetsError} = await supabase
            .from('raid_resets')
            .select('id')
            .eq('raid_id', raid_id)
            .neq('id', reset_id)
            .gt('raid_date', new Date().toISOString())
            .order('id', {ascending: true})
            .limit(100)
        if (futureResetsError) {
            alert('Error fetching future resets')
            return
        }


        const {error: deleteTemplateError} = await supabase.from('hard_reserve_templates')
            .delete()
            .eq('raid_id', raid_id)

        if (deleteTemplateError) {
            alert('Error deleting template')
            return
        }

        await Promise.all(futureResets?.map((x: any) => {
            return supabase.from('reset_hard_reserve')
                .delete()
                .eq('reset_id', x.id)
        }))

        const futureResetsData = futureResets.map((x: any) => {
            return hardReservations.map((y: any) => {
                return {
                    reset_id: x.id,
                    item_id: y.item_id
                }
            })
        }).flat()

        const templateData = hardReservations.map((x: any) => {
            return {
                item_id: x.item_id,
                raid_id: raid_id
            }
        })


        const [future, template] = await Promise.all([
            supabase.from('reset_hard_reserve').upsert(futureResetsData, {
                onConflict: 'item_id, reset_id'
            }),
            supabase.from('hard_reserve_templates').upsert(templateData, {
                onConflict: 'item_id, raid_id'
            })
        ])

        if (future.error || template.error) {
            alert('Error updating future raids')
            return
        }

        setUpdateLoading(false)
        alert('Future raids updated')

    }, [reset_id, hardReservations])

    return (
        <>
            <ScrollShadow className="flex flex-col gap-2 h-full overflow-auto max-h-96 scrollbar-pill">
                {hardReservations.map((hr: any) => (
                    <div key={hr.item_id}
                         className={`flex gap-2 justify-between items-center text-sm text-${getQualityColor(hr?.item?.description?.quality)} p-2 border border-wood rounded`}>
                        <Link href={`https://www.wowhead.com/classic/item=${hr.item_id}`}
                              className="flex gap-2 items-center" target="_blank">
                            <img src={hr.item.description.icon} alt={hr.item.name}
                                 className={`w-6 border border-${getQualityColor(hr?.item?.description?.quality)} rounded`}/>
                            <span>[{hr.item.name}]</span>
                        </Link>
                        {isAdmin && (
                            <button onClick={() => removeHardReserve(hr.item_id)}
                                    disabled={loading || globalLoading}
                                    className="text-red-500 hover:text-red-700">
                                <FontAwesomeIcon icon={faClose}/>
                            </button>
                        )}
                    </div>
                ))}
            </ScrollShadow>
            {isAdmin && (
                <Button
                    onClick={updateFutureRaids}
                    isLoading={updateLoading}
                    isDisabled={updateLoading}

                >
                    Update future raids
                </Button>
            )}
        </>
    );
}
