import { useEffect, useRef } from "react"
import { useUserPreferencesStore } from "@/app/stores/user-preferences-store"

export function useAudio(src: string) {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const volume = useUserPreferencesStore(state => state.soundVolume)

    if (!audioRef.current) {
        if (typeof Audio === 'undefined') {
            console.warn("Audio is not supported in this environment");
            return {
                play: async () => { },
                pause: () => { },
                stop: () => { },
            }
        }
        audioRef.current = new Audio(src)
    }

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.src = src
        }
    }, [src])

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume
        }
    }, [volume])

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
            }
        }
    }, [])

    const play = async () => {
        try {
            if (!audioRef.current) return
            await audioRef.current.play()
        } catch (error) {
            console.error("Error playing audio:", error)
        }
    }

    const pause = () => {
        audioRef.current?.pause()
    }

    const stop = () => {
        if (!audioRef.current) return
        audioRef.current.pause()
        audioRef.current.currentTime = 0
    }

    return { play, pause, stop }
}