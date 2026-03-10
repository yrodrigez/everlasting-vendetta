const audioRegistry = new Map<string, HTMLAudioElement>()

function getBaseAudio(src: string) {
    let audio = audioRegistry.get(src)

    if (!audio) {
        audio = new Audio(src)
        audioRegistry.set(src, audio)
    }

    return audio
}

export const audioManager = {
    async play(src: string, volume: number) {
        const baseAudio = getBaseAudio(src)
        const audio = baseAudio.cloneNode() as HTMLAudioElement
        audio.volume = volume
        try {
            await audio.play()
        } catch (error) {
            console.error(`Error playing audio ${src}:`, error)
        }
    },
}