'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { createAPIService } from '../lib/api'
import { useWoWItem } from '../hooks/api/use-wow-item'

declare global {
    interface Window {
        $WowheadPower?: { refreshLinks: () => void }
    }
}

type IconSize = 'tiny' | 'small' | 'medium' | 'large'

interface WoWHeadItemProps {
    itemId: number
    name?: string
    icon?: string
    gems?: number[]
    bonuses?: number[]
    enchant?: number
    pcs?: number[]
    iconSize?: IconSize
    domain?: 'classic' | 'tbc' | 'wotlk'
    className?: string
    children?: React.ReactNode
    quality?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'artifact' | 'heirloom' | string
    hideName?: boolean
    iconClassNames?: string
    nameClassNames?: string
}

export default function WoWHeadItem({
    itemId,
    name,
    icon,
    gems,
    bonuses,
    enchant,
    pcs,
    iconSize,
    domain = 'tbc',
    className,
    children,
    quality: _,
    hideName = false,
    iconClassNames,
    nameClassNames,
}: WoWHeadItemProps) {
    const ref = useRef<HTMLAnchorElement>(null)

    useEffect(() => {
        window.$WowheadPower?.refreshLinks()
    }, [itemId, gems, bonuses, enchant])

    const dataWowhead = buildDataWowhead({ gems, bonuses, enchant, pcs, domain })

    const href = domain
        ? `https://www.wowhead.com/${domain}/item=${itemId}`
        : `https://www.wowhead.com/item=${itemId}`


    const { data, isLoading, isError: error } = useWoWItem(itemId)

    return isLoading ? <span className={className}>Loading...</span> : error ?
        <span className={className}>{name ?? `Item ${itemId}`}</span> : (
            <a
                ref={ref}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
                {...(dataWowhead ? { 'data-wowhead': dataWowhead } : {})}
                {...(iconSize ? { 'data-wh-icon-size': iconSize } : {})}
            >
                {children ? children : (
                    <>
                        {data?.itemDetails?.icon && <img src={data?.itemDetails?.icon} alt={data.itemDetails.name} className={iconClassNames ?? `rounded border border-${data.itemDetails.quality?.name.toLowerCase() ?? 'white'} ${iconSize === 'tiny' ? 'w-4 h-4' : iconSize === 'small' ? 'w-6 h-6' : iconSize === 'medium' ? 'w-8 h-8' : 'w-12 h-12'}`} />}
                        {!hideName && data?.itemDetails?.name && <span className={nameClassNames ?? `text-${data.itemDetails.quality?.name.toLocaleLowerCase()}`}>{data.itemDetails.name}</span>}
                    </>
                )}
            </a>
        )
}

function buildDataWowhead({
    gems,
    bonuses,
    enchant,
    pcs,
    domain,
}: Pick<WoWHeadItemProps, 'gems' | 'bonuses' | 'enchant' | 'pcs' | 'domain'>): string {
    const parts: string[] = []

    if (domain) parts.push(`domain=${domain}`)
    if (gems?.length) parts.push(`gems=${gems.join(':')}`)
    if (bonuses?.length) parts.push(`bonus=${bonuses.join(':')}`)
    if (enchant) parts.push(`ench=${enchant}`)
    if (pcs?.length) parts.push(`pcs=${pcs.join(':')}`)

    return parts.join('&')
}
