'use client'
import {calculateTotalGearScore, getColorForGearScoreText} from "@/app/roster/[name]/ilvl";
import {useCharacterItemsStore} from "@/app/roster/[name]/characterItemsStore";
import {useEffect, useState} from "react";

function getQualityTypeNumber(quality: string) {
    const qualityTypes = {
        'POOR': 0,
        'COMMON': 1,
        'UNCOMMON': 2,
        'RARE': 3,
        'EPIC': 4,
        'LEGENDARY': 5,
    } as any

    return qualityTypes[quality] || 0
}

export default function GearScore({character}: { character: string }) {
    const [gearScore, setGearScore] = useState<string | number>('loading...')
    const [gearScoreColorName, setGearScoreColorName] = useState('text-common')
    const items = useCharacterItemsStore(state => state.items)
    useEffect(() => {
        const effectiveItems = items.filter((item: any) => item?.slot?.type !== 'SHIRT' && item?.slot?.type !== 'TABARD')
        const isLoading = !effectiveItems.length || effectiveItems.some((item: any) => item.loading)
        if (isLoading) {
            setGearScore('loading...')
            setGearScoreColorName('text-common')
            return
        }

        const gearForGearScore = effectiveItems.map((item: any) => {
            return {
                ilvl: item.details?.level || 0,
                type: `INVTYPE_${item.inventory_type?.type}`,
                rarity: getQualityTypeNumber(item.quality?.type),
                isEnchanted: !!(item.enchantments?.length)
            }
        }).filter(item => item.ilvl !== 0 || item.type !== 'INVTYPE_')
        const gearScore = gearForGearScore !== null ? calculateTotalGearScore(gearForGearScore) : 0
        const gearScoreColorName = `text-${getColorForGearScoreText(gearScore)}`
        setGearScore(gearScore)
        setGearScoreColorName(gearScoreColorName)
    }, [items, character])

    return (
        items && <p className="text-sm text-muted">Gear score: <span
          className={`${gearScoreColorName} font-bold`}>{gearScore}</span></p>
    )
}
