'use client'
import moment from "moment/moment";
import {useEffect, useState} from "react";

export const RaidTimer = ({timeToGo}: {
    timeToGo: string
}) => {
    const [timeLeft, setTimeLeft] = useState(moment(timeToGo).fromNow())

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(moment(timeToGo).fromNow())
        }, 10000)

        return () => clearInterval(interval)
    }, [])

    return (
        <>
            {timeLeft}
        </>
    )

}
