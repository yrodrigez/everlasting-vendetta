'use client'
import moment from "moment-timezone";
import {RaidTimer} from "@/app/raid/components/RaidTimer";


export default function RaidTimeInfo({raidDate, raidTime, raidEndDate, raidEndTime}: {
    raidDate: string,
    raidTime: string,
    raidEndDate: string
    raidEndTime: string
}) {
    const raidDateTime = moment(`${raidDate} ${raidTime}`, 'YYYY-MM-DD HH:mm:ss')

    const isRaidOver = moment.tz('Europe/Madrid').clone().isAfter(moment(`${raidEndDate} ${raidEndTime === '00:00:00' ? '23:59:59' : raidEndTime}`, 'YYYY-MM-DD HH:mm:ss').tz('Europe/Madrid'))
    const diff = raidDateTime.diff(moment())
    const duration = moment.duration(diff)
    const dayOfRaid = moment(raidDateTime).format('YYYY-MM-DD')
    const timeToGo = {
        days: duration.days(),
        hours: duration.hours(),
        minutes: duration.minutes(),
        isToday: moment().format('YYYY-MM-DD') === dayOfRaid,
        inProgress: raidDateTime.isBefore(moment())
    }

    return (
            <small
                className={`${timeToGo.inProgress && !isRaidOver ? 'text-yellow-500 blink' : (!timeToGo.isToday && !isRaidOver) ? 'text-green-500' : 'text-red-500'}`}>
                {
                    isRaidOver ? 'Raid is over' :
                        !timeToGo.isToday ? raidDateTime.isBefore(moment()) ? 'In progress' :
                                <RaidTimer timeToGo={
                                    moment(raidDateTime, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm')
                                }/> :
                            raidDateTime.fromNow()
                }
            </small>
    );
}
