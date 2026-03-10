import { useState } from "react";
import { Volume1, Volume2, VolumeOff } from "lucide-react";
import { useUserPreferencesStore } from "@/app/stores/user-preferences-store";
import { Button } from "@/app/components/Button";
import { Slider } from "@/app/components/slider";

export default function SystemVolume() {
    const soundVolume = useUserPreferencesStore((state) => state.soundVolume);
    const setSoundVolume = useUserPreferencesStore((state) => state.setSoundVolume);
    const [localVolume, setLocalVolume] = useState<number | null>(null);
    const displayVolume = localVolume ?? soundVolume * 100;
    const iconSize = 18;
    return (
        <div className="flex flex-col gap-2">
            <Slider
                size="sm"
                startContent={
                    <Button
                        isDisabled={displayVolume === 0}
                        isIconOnly size="sm" variant="light" onPress={() => setSoundVolume(0)} className="text-default">
                        {displayVolume === 0 ? <VolumeOff size={iconSize} /> : <Volume1 size={iconSize} />}
                    </Button>
                }
                value={displayVolume}
                onChange={(x) => {
                    if (typeof x === 'number')
                        setLocalVolume(x);
                }}
                onChangeEnd={(x) => {
                    if (typeof x === 'number') {
                        setSoundVolume(x / 100);
                        setLocalVolume(null);
                    }
                }}
                endContent={
                    <Button
                        isDisabled={displayVolume === 100}
                        isIconOnly size="sm" variant="light" onPress={() => setSoundVolume(1)} className="text-default">
                        <Volume2 size={iconSize} />
                    </Button>
                }
            />
        </div>
    )
}