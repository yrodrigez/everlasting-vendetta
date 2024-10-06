'use client'

import {Card, CardBody, Skeleton} from "@nextui-org/react";
import {CardFooter, CardHeader} from "@nextui-org/card";
import {useTheme} from "next-themes";
import React, {useEffect} from "react";
import moment from "moment/moment";
import {DpsIcon, KpisView} from "@/app/raid/components/KpisView";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHeart, faShield} from "@fortawesome/free-solid-svg-icons";

const MAX_RAID_RESETS = 9

export function CalendarSkeleton() {
    const {setTheme} = useTheme()

    useEffect(() => {
        setTheme('dark')
        return () => {
            setTheme('light')
        }
    }, [])

    return <div className="flex gap-3 flex-col justify-center items-center md:flex-wrap md:flex-row w-full">
        {Array.from({length: MAX_RAID_RESETS}).map((_, i) => (
            <Card
                key={i}
                isFooterBlurred
                className="w-[300px] relative text-default bg-[rgba(0,0,0,.6)] min-h-561 bg-dark border border-dark-100 h-[235px]"
                radius="lg">
                <CardHeader className="flex flex-col items-center bg-[rgba(0,0,0,.60)] justify-center gap-2">
                    <Skeleton className="rounded-lg h-4 w-48"/>
                    <Skeleton className="rounded-lg h-3 w-64"/>
                </CardHeader>
                <CardBody className="py-1 bg-[rgba(0,0,0,.60)] flex flex-col gap-2 justify-center">
                    <Skeleton className="rounded-lg h-2 w-24"/>
                    <Skeleton className="rounded-lg h-2 w-16"/>
                    <div className="grid grid-cols-2 w-14">
                        <FontAwesomeIcon icon={faShield}/>
                        <Skeleton className="rounded-lg w-3 h-3"/>

                        <FontAwesomeIcon icon={faHeart}/>
                        <Skeleton className="rounded-lg w-3 h-3"/>

                        <DpsIcon className="w-4 h-4"/>
                        <Skeleton className="rounded-lg w-3 h-3"/>
                    </div>
                </CardBody>
                <CardFooter className="bg-[rgba(0,0,0,.60)] px-6">
                    <Skeleton className="rounded-lg h-10 w-full"/>
                </CardFooter>
            </Card>
        ))}
    </div>
}
