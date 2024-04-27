'use client'
import {type CharacterWithLoot, type Item} from "@/app/raid/[id]/loot/components/types";
import {useWoWZamingCss} from "@/app/hooks/useWoWZamingCss";
import Image from "next/image";
import Link from "next/link";
import {Tooltip} from "@nextui-org/react";
import {faArrowRightLong} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useEffect, useState} from "react";


const Item = ({item}: { item: Item }) => {
    const qualityColor = [
        'poor',
        'common',
        'uncommon',
        'rare',
        'epic',
        'legendary',
    ][item.quality]
    return (
        <Tooltip
            className={`bg-black border border-${qualityColor} rounded max-w-64`}
            content={
                <div
                    dangerouslySetInnerHTML={{__html: item.tooltip || ''}}
                />
            }
            placement="top"
        >
            <Image
                className={`rounded-lg border border-${qualityColor} block bg-cover relative`}
                src={item.icon} width={36} height={36} alt={item.name}
            />
        </Tooltip>
    )
}

export function LootItem({loot}: { loot: CharacterWithLoot }) {
    useWoWZamingCss() // This is a custom hook that loads the WoW Zaming CSS

    const [characterAvatar, setCharacterAvatar] = useState<string | null | undefined>(null)
    useEffect(() => {
        if (loot.character === '_disenchanted') {
            return
        }

        fetch(`${window.location.origin}/api/v1/services/member/avatar/get?characterName=${encodeURIComponent(loot.character.toLowerCase())}`)
            .then(response => response.json())
            .then(data => {
                setCharacterAvatar(data.avatar)
            })

    })

    return (
        <div className={`rounded-lg grid grid-cols-3 items-center gap-2 justify-center mb-1`}>
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
                            <Image className={`rounded-lg border border-gold`} src={'/disenchant.jpg'}
                                   alt={'Disenchanted'} width={36} height={36}/>
                            <div className={`whitespace-pre p-1`}>Disenchanted</div>
                        </div>
                    </Tooltip>
                ) : (
                    <Link
                        className={
                            `flex flex-col items-center p-2`
                        }
                        href={`/roster/${encodeURIComponent(loot.character.toLowerCase())}`}>
                        {characterAvatar && <Image
                          className={`rounded-lg border border-gold block bg-cover relative`}
                          src={characterAvatar === 'unknown' ? '/avatar-anon.png' : characterAvatar} width={36}
                          height={36} alt={loot.character}
                        />}
                        <div className={`whitespace-pre p-1`}>{loot.character}</div>
                    </Link>
                )
            }
            <div className={
                `flex items-center gap-2 p-2 justify-center`
            }>
                <FontAwesomeIcon icon={faArrowRightLong}/>
            </div>
            <div className={
                `flex  gap-2 p-2 overflow-auto scrollbar-pill`
            }>
                {loot.loot.map((item, i) => {
                    return <Item key={i} item={{...item.item, id: item.itemID}}/>
                })}
            </div>
        </div>

    )
}
