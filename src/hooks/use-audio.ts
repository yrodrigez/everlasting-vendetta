import { useCallback } from "react"
import { useUserPreferencesStore } from "@/stores/user-preferences-store"
import { audioManager } from '@/util/audio-manager'

export function useAudio(src: string) {
    const volume = useUserPreferencesStore(state => state.soundVolume)

    const play = useCallback(async () => {
        await audioManager.play(src, volume)
    }, [src, volume])

    return { play }
}