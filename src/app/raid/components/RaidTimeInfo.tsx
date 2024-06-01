'use client'
import moment from "moment/moment";
import {RaidTimer} from "@/app/raid/components/RaidTimer";


export default function RaidTimeInfo({raidDate, raidTime, raidEndDate}: {
    raidDate: string,
    raidTime: string,
    raidEndDate: string
}) {
    const raidDateTime = moment(`${raidDate} ${raidTime}`, 'YYYY-MM-DD HH:mm')
    const isRaidOver = moment().isAfter(moment(`${raidEndDate} ${raidTime}`, 'YYYY-MM-DD HH:mm'))
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
        isRaidOver ? null :
            <small
                className={`${timeToGo.inProgress && !isRaidOver ? 'text-yellow-500 blink' : (!timeToGo.isToday && !isRaidOver) ? 'text-green-500' : 'text-red-500'}`}>
                {
                    isRaidOver ? 'Raid is over' :
                        timeToGo.isToday ? raidDateTime.isBefore(moment()) ? 'In progress' :
                                <RaidTimer timeToGo={
                                    moment(raidDateTime, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm')
                                }/> :
                            raidDateTime.fromNow()
                }
            </small>
    );
}
