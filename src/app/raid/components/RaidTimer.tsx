'use client'
import moment from "moment/moment";
import {useEffect, useState} from "react";

export const RaidTimer = ({timeToGo}: {
    timeToGo: string
}) => {

    function getTimeLeft() {
        const _timeToGo = moment(timeToGo).fromNow()
        return _timeToGo[0].toUpperCase() + _timeToGo.slice(1)
    }

    const [timeLeft, setTimeLeft] = useState(getTimeLeft())

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(getTimeLeft())
        }, 10000)

        return () => clearInterval(interval)
    }, [])

    return (
        <>
            {timeLeft}
        </>
    )

}
