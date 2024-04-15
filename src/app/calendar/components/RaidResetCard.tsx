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




export function RaidResetCard({raidDate, raidName, raidImage, raidTime = '20:30', id, raidRegistrations}: {
    id: string,
    raidDate: string,
    raidName: string,
    raidImage: string,
    raidTime?: string,
    raidRegistrations: any[]
}) {
    const router = useRouter()
    const participants = useParticipants(id, raidRegistrations)

    return (
        <>
            <Card className="bg-wood border-none w-[300px] text-default" radius="lg">
                <Image
                    removeWrapper
                    alt="Card background"
                    className="z-0 w-full h-full object-cover absolute"
                    src={raidImage}
                    width={300}
                />
                <div
                    className="absolute w-full h-full bg-black bg-[rgba(0,0,0,.6)] z-1"
                />
                <CardHeader className="flex flex-col bg-[rgba(0,0,0,.6)] shadow-xl">
                    <h4 className="font-bold text-large text-gold">{raidName}</h4>
                    <small className="text-primary">{moment(raidDate).format('dddd, MMMM D')} - {raidTime}</small>
                </CardHeader>
                <CardBody className="py-1">
                    <RaidTimeInfo raidDate={raidDate} raidTime={raidTime}/>
                    <KpisView participants={participants} raidId={id}/>
                </CardBody>
                <CardFooter>
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
        </>
    );
}
