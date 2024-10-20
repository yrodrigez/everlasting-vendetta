'use client'
import {Skeleton} from "@nextui-org/react";
import {useTheme} from "next-themes";
import React, {useEffect} from "react";
import {RaidCardSkeleton} from "@/app/calendar/CalendarSkeleton";

const CalendarSkeleton = () => {
    return (
        <div
            className="rounded-xl scrollbar-pill w-64 h-[274px] bg-dark border border-dark-100 flex items-center gap-2 flex-col">
            <div className="flex flex-col gap-2 w-full items-center p-4 bg-wood rounded-t-xl border border-transparent">
                <Skeleton className="rounded-lg h-5 w-56 border border-wood"/>
                <div className="flex gap-2 mt-2">
                    {Array.from({length: 7}).map((_, i) => (
                        <Skeleton key={i} className="rounded-full w-6 h-6 border border-wood"/>
                    ))}
                </div>
            </div>
            <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
                {Array.from({length: 5}).map((_, i) => (
                    <div key={i} className="flex gap-2 w-full items-center justify-center">
                        {Array.from({length: 7}).map((_, i) => (
                            <Skeleton key={i} className="rounded-full w-6 h-6 border border-wood"/>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

export function CalendarEditSkeleton() {
    const {setTheme} = useTheme()

    useEffect(() => {
        setTheme('dark')
        return () => {
            setTheme('light')
        }
    }, [])

    return (
        <div className="flex flex-col gap-8 w-full h-full p-2 scrollbar-pill">
            <div className="flex flex-col lg:flex-row gap-2 w-full overflow-auto">
                <div
                    className="flex w-full gap-2 items-center lg:items-start flex-col">
                    <Skeleton className="w-full max-w-[400px] h-14 rounded-xl border-wood border"/>
                    <Skeleton className="w-full max-w-[400px] h-14 rounded-xl border-wood border"/>
                    <Skeleton className="w-full max-w-[400px] h-14 rounded-xl border-wood border"/>
                    <Skeleton className="w-full max-w-[400px] h-14 rounded-xl border-wood border"/>
                    <div className="flex gap-2 w-full">
                        {Array.from({length: 7}).map((_, i) => (
                            <Skeleton key={i} className="flex-1 h-10 w-full rounded-full border-wood border"/>
                        ))}
                    </div>
                </div>
                <div
                    className="flex justify-center gap-2 items-center flex-col ">
                    <RaidCardSkeleton/>
                    <CalendarSkeleton/>
                </div>
            </div>
            {/*<EditRaidButton reset={reset}/>*/}
        </div>
    )
}
