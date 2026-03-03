'use client'
import { Switch } from "@/app/components/switch";
import { Input } from "@/app/components/input";
import useCreateRaidStore from "./useCreateRaidStore";
import { useShallow } from "zustand/shallow";

export const SoftReservesManager = () => {
    const {
        raid,
        allowSoftReserves,
        setAllowSoftReserves,
        softReservesAmmount,
        setSoftReservesAmmount,
        onTimeBonusExtraEnabled,
        setOnTimeBonusExtraEnabled,
        onTimeBonusExtraAmmount,
        setOnTimeBonusExtraAmmount,
        onTimeBonusCutoffHours,
        setOnTimeBonusCutoffHours,
    } = useCreateRaidStore(useShallow(state => ({
        raid: state.raid,
        allowSoftReserves: state.allowSoftReserves,
        setAllowSoftReserves: state.setAllowSoftReserves,
        softReservesAmmount: state.softReservesAmmount,
        setSoftReservesAmmount: state.setSoftReservesAmmount,
        onTimeBonusExtraEnabled: state.onTimeBonusExtraEnabled,
        setOnTimeBonusExtraEnabled: state.setOnTimeBonusExtraEnabled,
        onTimeBonusExtraAmmount: state.onTimeBonusExtraAmmount,
        setOnTimeBonusExtraAmmount: state.setOnTimeBonusExtraAmmount,
        onTimeBonusCutoffHours: state.onTimeBonusCutoffHours,
        setOnTimeBonusCutoffHours: state.setOnTimeBonusCutoffHours,
    })))

    return (
        <div className="w-full max-w-[400px] flex flex-col gap-4">
            <Switch
                isDisabled={!raid}
                isSelected={allowSoftReserves}
                onValueChange={setAllowSoftReserves}
            >
                Allow Soft Reserves
            </Switch>

            {allowSoftReserves && (
                <>
                    <Input
                        type="number"
                        label="Reserve Amount"
                        value={String(softReservesAmmount)}
                        onValueChange={(val) => setSoftReservesAmmount(Number(val) || 0)}
                        min={0}
                    />

                    <Switch
                        isDisabled={!raid}
                        isSelected={onTimeBonusExtraEnabled}
                        onValueChange={setOnTimeBonusExtraEnabled}
                    >
                        On-Time Bonus Extra Reserves
                    </Switch>

                    {onTimeBonusExtraEnabled && (
                        <div className="flex flex-col gap-4 pl-2 border-l-2 border-wood-100">
                            <Input
                                type="number"
                                label="Extra Reservations"
                                value={String(onTimeBonusExtraAmmount)}
                                onValueChange={(val) => setOnTimeBonusExtraAmmount(Number(val) || 0)}
                                min={0}
                            />
                            <Input
                                type="number"
                                label="Cutoff Hours (before raid)"
                                value={String(onTimeBonusCutoffHours)}
                                onValueChange={(val) => setOnTimeBonusCutoffHours(Number(val) || 0)}
                                min={0}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
