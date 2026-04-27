'use client'

import { getCompositionCount } from "@/app/calendar/new/Components/useCreateRaidStore";
import useCreateRaidStore from "@/app/calendar/new/Components/useCreateRaidStore";
import { Input } from "@/components/input";
import { useShallow } from "zustand/shallow";

const normalizeCount = (value: string) => Math.max(Number(value) || 0, 0)

export function CompositionManager() {
    const { raid, composition, setComposition } = useCreateRaidStore(useShallow(state => ({
        raid: state.raid,
        composition: state.composition,
        setComposition: state.setComposition,
    })))

    if (!raid || !composition) return null

    const compositionCount = getCompositionCount(composition)
    const isValid = compositionCount === raid.size
    const updateComposition = (key: 'tanks' | 'healers' | 'dps', value: string) => {
        setComposition({
            ...composition,
            [key]: normalizeCount(value),
            raid_lead: 1,
        })
    }

    return (
        <div className="w-full max-w-[400px] flex flex-col gap-3 rounded-lg border border-wood-100 bg-wood-900/40 p-3">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-gold">Raid Composition</h3>
                <span className={`text-xs font-semibold ${isValid ? 'text-success' : 'text-danger'}`}>
                    {compositionCount} / {raid.size}
                </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <Input
                    type="number"
                    label="Tanks"
                    value={String(composition.tanks)}
                    onValueChange={(value) => updateComposition('tanks', value)}
                    min={0}
                />
                <Input
                    type="number"
                    label="Healers"
                    value={String(composition.healers)}
                    onValueChange={(value) => updateComposition('healers', value)}
                    min={0}
                />
                <Input
                    type="number"
                    label="DPS"
                    value={String(composition.dps)}
                    onValueChange={(value) => updateComposition('dps', value)}
                    min={0}
                />
            </div>
            {!isValid ? (
                <span className="text-xs text-danger">
                    Tanks, healers, and DPS must add up exactly to the raid size.
                </span>
            ) : null}
        </div>
    )
}
