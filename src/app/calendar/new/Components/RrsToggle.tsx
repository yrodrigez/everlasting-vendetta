'use client'

import { Switch } from "@/components/switch";
import useCreateRaidStore from "./useCreateRaidStore";
import { useShallow } from "zustand/shallow";

export function RrsToggle() {
    const { raid, isRrsActive, setIsRrsActive } = useCreateRaidStore(useShallow(state => ({
        raid: state.raid,
        isRrsActive: state.isRrsActive,
        setIsRrsActive: state.setIsRrsActive,
    })))

    return (
        <div className="w-full max-w-[400px]">
            <Switch
                isDisabled={!raid}
                isSelected={isRrsActive}
                onValueChange={setIsRrsActive}
            >
                Count this reset for RRS
            </Switch>
        </div>
    )
}
