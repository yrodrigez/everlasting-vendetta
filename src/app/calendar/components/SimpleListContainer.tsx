'use client'
import React, {useEffect, useState} from "react";
import {RaidItem} from "@/app/calendar/components/RaidItemsList";

export default function SimpleListContainer({children, minus = 160}: { children: React.ReactNode, minus?: number }) {
    const [listMaxHeight, setListMaxHeight] = useState(0)
    useEffect(() => {
        const resizer = () => {
            const contentContainer = document.getElementById('content-container')
            if (contentContainer) {
                setListMaxHeight(contentContainer.clientHeight - minus)
            }
        }
        resizer()
        const interval = setInterval(() => {
            resizer()
        }, 1000)

        window.addEventListener('resize', resizer)
        return () => {
            window.removeEventListener('resize', resizer)
            clearInterval(interval)
        }
    }, [])

    return (
        <div className="overflow-auto w-96 scrollbar-pill flex flex-col gap-3" style={{
            height: listMaxHeight
        }}>
            {children}
        </div>
    )
}
