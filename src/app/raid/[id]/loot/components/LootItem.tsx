'use client'
import {type RaidLoot} from "@/app/raid/[id]/loot/components/types";
import {useWoWZamingCss} from "@/app/hooks/useWoWZamingCss";
import Image from "next/image";
import Link from "next/link";
import {Tooltip} from "@nextui-org/react";
import {faArrowRightLong} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useEffect, useState} from "react";

export function LootItem({loot}: { loot: RaidLoot }) {
    useWoWZamingCss() // This is a custom hook that loads the WoW Zaming CSS
    const qualityColor = [
        'poor',
        'common',
        'uncommon',
        'rare',
        'epic',
        'legendary',
    ][loot.item.quality]
    const [characterAvatar, setCharacterAvatar] = useState<string | null | undefined>(null)
    useEffect(() => {
        if (loot.character === '_disenchanted') {
            return
        }

        fetch(`${window.location.origin}/api/v1/services/member/avatar/get?characterName=${encodeURIComponent(loot.character.toLowerCase())}`)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                setCharacterAvatar(data.avatar)
            })

    })
    return (
        <div
            className={`
             rounded-lg grid grid-cols-3 items-center gap-2 justify-center border border-${qualityColor} mb-1
            `}
        >
            <Tooltip
                className={`bg-black border border-${qualityColor} rounded max-w-64`}
                content={
                    <div
                        dangerouslySetInnerHTML={{__html: loot.item.tooltip || ''}}
                    />
                }
                placement="right"
            >
                <div className={
                    `flex items-center gap-2 p-2`
                }>
                    <Image
                        className={`rounded-lg border border-${loot.item.quality} block bg-cover relative`}
                        src={loot.item.icon} width={36} height={36} alt={loot.item.name}
                    />
                    <div className="flex flex-col">
                        <Link
                            data-wowhead={`domain=classic&item=${loot.id}`}
                            target="_blank"
                            href={`https://www.wowhead.com/classic/item=${loot.id}`}>
                            <div className={`whitespace-pre p-1 underline text-${qualityColor}`}>{loot.item.name}</div>
                        </Link>
                    </div>
                </div>
            </Tooltip>
            <div className={
                `flex items-center gap-2 p-2 justify-center`
            }>
                <FontAwesomeIcon icon={faArrowRightLong}/>
            </div>
            {
                loot.character === '_disenchanted' ? (
                    <Tooltip
                        className={`bg-black border border-gold rounded max-w-64`}
                        content='Disenchanted'
                    >
                        <div
                            className={
                                `flex flex-col items-center gap-2 p-2`
                            }
                        >
                            <Image src={'/disenchant.jpg'} alt={'Disenchanted'} width={36} height={36}/>
                            <div className={`whitespace-pre p-1`}>Disenchanted</div>
                        </div>
                    </Tooltip>
                ) : (
                    <Link
                        className={
                            `flex flex-col items-center gap-2 p-2`
                        }
                        href={`/member/${encodeURIComponent(loot.character)}`}>
                        {characterAvatar && characterAvatar !== 'unknown' && <Image
                          className={`rounded-lg border border-gold block bg-cover relative`}
                          src={characterAvatar || '/avatar.jpg'} width={36} height={36} alt={loot.character}
                        />}
                        <div className={`whitespace-pre p-1`}>{loot.character}</div>
                    </Link>
                )
            }
        </div>

    )
}
