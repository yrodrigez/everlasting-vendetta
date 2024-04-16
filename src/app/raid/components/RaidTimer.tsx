'use client'
import moment, {Moment} from "moment/moment";
import {useEffect, useState} from "react";

export const RaidTimer = ({timeToGo}: {
    timeToGo: Moment
}) => {

    const calculateAndSetTimeLeft = () => {
        const raidTime = moment(timeToGo)
        const currentTime = moment()

        return ({
            hours: raidTime.diff(currentTime, 'hours'),
            minutes: raidTime.diff(currentTime, 'minutes') % 60,
        })
    }
    const [timeLeft, setTimeLeft] = useState(calculateAndSetTimeLeft())

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(calculateAndSetTimeLeft())
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    return (
        <>
            {timeLeft.hours > 0 ? `${timeLeft.hours} hours and ${timeLeft.minutes} minutes` : `${timeLeft.minutes} minutes`} to
            go
        </>
    )

}
