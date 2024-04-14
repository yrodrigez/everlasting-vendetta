'use client'
import {calculateTotalGearScore, getColorForGearScoreText} from "@/app/roster/[name]/ilvl";
import {useCharacterItemsStore} from "@/app/roster/[name]/characterItemsStore";
import {useEffect, useState} from "react";
import {Skeleton} from "@nextui-org/react";

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
    const [isLoading, setIsLoading] = useState(true)
    const items = useCharacterItemsStore(state => state.items)
    useEffect(() => {
        const effectiveItems = items.filter((item: any) => item?.slot?.type !== 'SHIRT' && item?.slot?.type !== 'TABARD')
        const isLoading = !effectiveItems.length || effectiveItems.some((item: any) => item.loading)
        setIsLoading(isLoading)

        const gearForGearScore = effectiveItems.map((item: any) => {
            return {
                ilvl: item.details?.level || 0,
                type: `INVTYPE_${item.inventory_type?.type}`,
                rarity: getQualityTypeNumber(item.quality?.type),
                isEnchanted: !!(item.enchantments?.length)
            }
        }).filter(item => item.ilvl !== 0 || item.type !== 'INVTYPE_')
        const gearScore = calculateTotalGearScore(gearForGearScore)
        const gearScoreColorName = `text-${getColorForGearScoreText(gearScore)}`
        setGearScore(gearScore)
        setGearScoreColorName(gearScoreColorName)
    }, [items, character])

    return (
        <div className="flex gap-1 items-center">
            <p className="text-sm text-muted">Gear score: </p>
            <Skeleton isLoaded={!isLoading} className="rounded bg-wood h-6 w-8">
                <span className={`${gearScoreColorName} font-bold text-sm text-muted`}>{gearScore}</span>
            </Skeleton>
        </div>
    )


}
