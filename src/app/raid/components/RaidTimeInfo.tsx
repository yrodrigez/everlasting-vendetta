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
    const currentTime = moment()
    const diff = raidDateTime.diff(currentTime)
    const duration = moment.duration(diff)
    const dayOfRaid = moment(raidDate).format('YYYY-MM-DD')
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
                        timeToGo.days <= 0 ? moment(`${raidDate} ${raidTime}`, 'YYYY-MM-DD HH:mm').isBefore(moment()) ? 'In progress' :
                                <RaidTimer timeToGo={
                                    moment(`${raidDate} ${raidTime}`, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm')
                                }/> :
                            `${timeToGo.days} days to go`
                }
            </small>
    );
}
