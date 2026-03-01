'use client'

import { useEffect, useRef } from 'react'

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
    quality?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'artifact' | 'heirloom'
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
    quality,
}: WoWHeadItemProps) {
    const ref = useRef<HTMLAnchorElement>(null)

    useEffect(() => {
        window.$WowheadPower?.refreshLinks()
    }, [itemId, gems, bonuses, enchant])

    const dataWowhead = buildDataWowhead({ gems, bonuses, enchant, pcs, domain })

    const href = domain
        ? `https://www.wowhead.com/${domain}/item=${itemId}`
        : `https://www.wowhead.com/item=${itemId}`

    return (
        <a
            ref={ref}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
            {...(dataWowhead ? { 'data-wowhead': dataWowhead } : {})}
            {...(iconSize ? { 'data-wh-icon-size': iconSize } : {})}
        >
            {children ?? (
                <>
                    {icon && <img src={icon} alt={name} className={`rounded border border-${quality ? quality : 'white'} ${iconSize === 'tiny' ? 'w-4 h-4' : iconSize === 'small' ? 'w-6 h-6' : iconSize === 'medium' ? 'w-8 h-8' : 'w-12 h-12'}`} />}
                    {name && <span>{name}</span>}
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