'use client'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faVolcano} from "@fortawesome/free-solid-svg-icons";
import moment from "moment-timezone";
import {useEffect, useState} from "react";

function getEruptionDuration() {
    const spanishTime = moment.tz("Europe/Madrid");
    const nextHour = spanishTime.clone().add(1, 'hour').startOf('hour');
    return moment.duration(nextHour.diff(spanishTime));
}

export function BlackrockEruptionBanner() {
    const [isLive, setIsLive] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(getEruptionDuration());

    useEffect(() => {
        const interval = setInterval(() => {
            const spanishTime = moment.tz("Europe/Madrid");
            // is live if the current hour is pair
            setIsLive(spanishTime.hour() % 2 === 0);
            // time remaining until the next eruption or to the next hour

            setTimeRemaining(getEruptionDuration());

        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className="flex items-center justify-center px-4 h-14 bg-orange-800 z-50 rounded-lg border border-orange-500 shadow-lg shadow-orange-700">
            <FontAwesomeIcon icon={faVolcano} className="text-white"
                             bounce={isLive}
            />
            <div className="flex flex-col items-center justify-center">
                <span className="text-white font-bold ml-2">Blackrock Eruption</span>
                <span className="text-white flex items-center gap-2 text-xs">
                    {isLive ? 'Remaining' : 'Next'}: {timeRemaining?.hours()}h {timeRemaining?.minutes()}m {timeRemaining?.seconds()}s
                </span>
            </div>
        </div>
    )
}
