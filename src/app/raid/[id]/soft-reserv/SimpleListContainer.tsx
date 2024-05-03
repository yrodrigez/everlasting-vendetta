'use client'
import React, {useEffect, useState} from "react";

export default function SimpleListContainer({children, minus = 160, className}: {
    children: React.ReactNode,
    minus?: number,
    className?: string
}) {
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
        <div className={className} style={{
            height: listMaxHeight,
            overflow: 'auto',
        }}>
            {children}
        </div>
    )
}
