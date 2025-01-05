'use client'
import moment from "moment-timezone";
import {RaidTimer} from "@/app/raid/components/RaidTimer";


export default function RaidTimeInfo({raidDate, raidTime, raidEndDate, raidEndTime}: {
    raidDate: string,
    raidTime: string,
    raidEndDate: string
    raidEndTime: string
}) {
    const timezone = 'Europe/Madrid' // for UK timezone use 'Europe/London'

    const raidDateTime = moment.tz(`${raidDate}T${raidTime}`, timezone);

    const now = moment.tz(timezone);
    const isRaidOver = now.isAfter(moment.tz(`${raidEndDate}T${raidEndTime}`, timezone));

    const diff = raidDateTime.diff(now);
    const duration = moment.duration(diff < 0 ? 0 : diff); // Prevent negative values

    const dayOfRaid = moment(raidDateTime).format('YYYY-MM-DD')
    const timeToGo = {
        days: duration.days(),
        hours: duration.hours(),
        minutes: duration.minutes(),
        isToday: moment().tz(timezone).format('YYYY-MM-DD') === dayOfRaid,
        inProgress: raidDateTime.isBefore(moment().tz(timezone))
    }

    return (
            <small
                className={`${timeToGo.inProgress && !isRaidOver ? 'text-yellow-500 blink' : (!timeToGo.isToday && !isRaidOver) ? 'text-green-500' : 'text-red-500'}`}>
                {
                    isRaidOver ? 'Raid is over' :
                        !timeToGo.isToday ? raidDateTime.isBefore(moment().tz(timezone)) ? 'In progress' :
                                <RaidTimer timeToGo={
                                    moment(raidDateTime, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm')
                                }/> :
                            raidDateTime.tz(timezone).fromNow()
                }
            </small>
    );
}
