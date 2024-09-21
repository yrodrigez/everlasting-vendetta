'use client'
import {
    Card,
    CardBody,
    Image,
    Button,
} from "@nextui-org/react"
import RaidTimeInfo from "@/app/raid/components/RaidTimeInfo";
import {useRouter} from "next/navigation";
import {KpisView} from "@/app/raid/components/KpisView";
import {CardFooter, CardHeader} from "@nextui-org/card";
import {useParticipants} from "@/app/raid/components/useParticipants";
import moment from "moment";

export function RaidResetCard({
                                  raidDate, raidName, raidImage, raidTime = '20:30', id, raidRegistrations,
                                  raidEndDate
                              }: {
    id: string,
    raidDate: string,
    raidName: string,
    raidImage: string,
    raidTime?: string,
    raidRegistrations: any[]
    raidEndDate: string
}) {
    const router = useRouter()
    const participants = useParticipants(id, raidRegistrations)
    const isRaidCurrent = moment().isBetween(moment(raidDate), moment(raidEndDate))

    return (
        <Card
            isFooterBlurred
            className={`w-[300px] relative text-default bg-[rgba(0,0,0,.6)] ${
            isRaidCurrent ? 'border-2 border-gold shadow-2xl shadow-gold glow-animation ' : 'border-1 border-[rgba(255,255,255,.2)]'    
        }`} radius="lg">
            <Image
                removeWrapper
                alt="Card background"
                className="w-full h-full object-cover absolute z-0 filter brightness-50"
                src={raidImage}
                width={300}
            />
            <CardHeader className="flex flex-col  shadow-xl bg-[rgba(0,0,0,.60)]">
                <h4 className="font-bold text-large text-gold">{raidName}</h4>
                <small className="text-primary">{moment(raidDate).format('dddd, MMMM D')} - {raidTime.substring(0,5)} to {'00:00'}</small>
            </CardHeader>
            <CardBody className="py-1 bg-[rgba(0,0,0,.60)]">
                <RaidTimeInfo
                    raidEndDate={raidEndDate}
                    raidDate={raidDate}
                    raidTime={raidTime}
                />
                <KpisView
                    participants={participants}
                    raidId={id}
                    raidInProgress={moment().isBetween(moment(raidDate), moment(raidDate).add(1, 'days'))}
                />
            </CardBody>
            <CardFooter className="bg-[rgba(0,0,0,.60)]">
                <Button
                    onClick={() => {
                        router.push(`/raid/${id}`)
                    }}
                    className="w-full bg-moss hover:bg-moss-600 text-gold font-bold"
                >
                    Open
                </Button>
            </CardFooter>
        </Card>
    );
}
