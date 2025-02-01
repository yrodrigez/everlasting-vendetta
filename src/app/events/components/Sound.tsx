'use client';
import {useCallback, useEffect, useState} from "react";
import {Button} from "@/app/components/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faVolumeHigh, faVolumeXmark} from "@fortawesome/free-solid-svg-icons";
import {useMessageBox} from "@utils/msgBox";

export default function Sound({sound}: { sound: string }) {
    const [audio, setAudio] = useState<HTMLAudioElement | null>();
    const [isPlaying, setIsPlaying] = useState(false);
    const {yesNo} = useMessageBox();

    useEffect(() => {
        if (!sound) return;

        if(audio) return;
        const _audio = new Audio(sound);
        _audio.load();
        _audio.loop = true;

        _audio.play().then(() => {
            setIsPlaying(true);
            _audio.volume = 0.05;
        }).catch(async (err) => {
            setIsPlaying(false);
            if(err?.message?.indexOf('The play() request was interrupted') !== -1) return;
            console.log(err.message);
            const alert = await yesNo({
                title: 'Full experience!',
                message: 'Would you like to enable sound effects?',
                yesText: 'Yes',
                noText: 'No'
            });
            if(alert === 'yes') {
                _audio.play();
                _audio.volume = 0.05;
                setIsPlaying(true);
            }
        })
        setAudio(_audio);

        return () => {
            _audio.pause();
            _audio.remove();
        }
    }, []);

    const play = useCallback(() => {
        audio?.play().then(() => {
            setIsPlaying(true);
            audio.volume = 0.05;
        }).catch(() => {
            setIsPlaying(false);
        });

    }, [audio]);

    const pause = useCallback(() => {
        audio?.pause()
        setIsPlaying(false);
    }, [audio]);

    return audio && (
        <Button onPress={isPlaying ? pause : play} variant="light" isIconOnly className="text-gold">
            <FontAwesomeIcon icon={isPlaying ? faVolumeHigh : faVolumeXmark}/>
        </Button>
    )
}