'use client'
import Link from "next/link";
import Image from "next/image";
import createServerSession from "@utils/supabase/createServerSession";
import {cookies} from "next/headers";
import {GUILD_ID} from "@utils/constants";
import {Badge} from "@nextui-org/badge";
import useApplicants from "@hooks/useApplicants";
import {useEffect, useState} from "react";

const Children = ({text, imgKey}: { text: string, imgKey: string }) => (
    <>
        <Image
            width="36"
            height="36"
            alt={text} src={`/btn-${imgKey}.png`}
            className="rounded-full w-9 h-9 min-h-9 max-h-9 min-w-9 max-w-9"/>
        <span>{text}</span>
    </>
)
export const HeaderMenuButton = ({text, url, onClick}: {
    text: string,
    url?: string,
    onClick?: (() => void) | undefined
}) => {
    const key = text.toLowerCase();
    const allowed = ['apply', 'roster', 'calendar', 'stats'];
    const className = "px-2 py-1 flex flex-col items-center rounded hover:cursor-pointer hover:bg-white hover:bg-opacity-20 backdrop-filter backdrop-blur-md min-w-16 max-w-16";

    const [_url, setUrl] = useState<string | undefined>(url)
    const [_text, setText] = useState<string>(text)


    const {applyCount, canReadApplications} = useApplicants()

    useEffect(() => {
        if (key === 'apply' && canReadApplications) {
            setUrl('/apply/list')
            setText('Applies')
        }
    }, [applyCount, canReadApplications])

    return (onClick ? (
            <div
                className={className}
                onClick={onClick}>
                <Children text={_text} imgKey={key}/>
            </div>
        ) : (
            <Badge
                content={applyCount}
                classNames={{
                    badge: 'mt-1',
                }}
                showOutline={false}
                className="shadow-sm text-gold bg-dark border-gold border-1 shadow-gold"
                isInvisible={!applyCount}
            >
                <Link
                    className={className}
                    href={_url || `/${allowed.indexOf(key) === -1 ? '' : key}`}>
                    <Children text={_text} imgKey={key}/>
                </Link>
            </Badge>
        )
    )
}
