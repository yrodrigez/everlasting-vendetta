import {Tooltip} from "@heroui/react";
import Image from "next/image";
import {ItemTooltip} from "@/app/components/item/ItemTooltip";
import {useWoWZamingCss} from "@/app/hooks/useWoWZamingCss";

export function Item({item}: {
    item: { description: { icon: string, quality: number, tooltip: string }, name: string }
}) {
    useWoWZamingCss()

    const qualityColor = [
        'poor',
        'common',
        'uncommon',
        'rare',
        'epic',
        'legendary',
    ][item.description.quality ?? 0] as 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

    return (
        <div className="flex items-center gap-2">
            <Tooltip
                className={'bg-transparent border-none shadow-none'}
                // @ts-ignore - nextui types are wrong
                shadow={'none'}
                placement={'right'}
                offset={20}
                content={
                    <div className="flex gap">
                        <ItemTooltip
                            item={item}
                            qualityColor={qualityColor}
                        />
                    </div>
                }
            >
                <Image
                    src={item.description.icon}
                    alt={item.name}
                    width={40}
                    height={40}
                    className={`border-gold border rounded-md`}
                />
            </Tooltip>
            <span>{item?.name}</span>
        </div>
    )
}
