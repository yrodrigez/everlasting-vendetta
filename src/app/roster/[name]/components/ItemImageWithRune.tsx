'use client'
import {ItemDetails} from "@/app/components/CharacterItem";
import {Tooltip} from "@nextui-org/react";

import {ItemDetailedView} from "@/app/roster/[name]/components/ItemDetailedView";
import {useSharedTooltipStore} from "@/app/roster/[name]/components/sharedTooltipstore";

export function ItemImageWithRune({
                                      item, itemIconUrl, borderColor, reverse = false, bottom = false
                                  }: {
    item: ItemDetails
    itemIconUrl: string
    borderColor: string
    reverse?: boolean
    bottom?: boolean
}) {
    const rune = item?.enchantments?.find((enchant: any) => enchant.enchantment_slot.type === 'TEMPORARY')
    const runeKey = rune?.display_string
        .replaceAll(' ', '_')
        .replace(/[.]/g, '_')
        .replace(/[-']/g, '_')
        .toLowerCase() || ''

    const itemId = item?.item?.id

    const {
        setIsClicked,
        setIsHovered,
        setItemId
    } = useSharedTooltipStore(state => ({
        setIsClicked: state.setIsClicked,
        setIsHovered: state.setIsHovered,
        setItemId: state.setItemId
    }))

    const isHovered = useSharedTooltipStore(state => state.isHovered)
    const isClicked = useSharedTooltipStore(state => state.isClicked)
    const sharedItemId = useSharedTooltipStore(state => state.itemId)

    return (
        <Tooltip
            isDisabled={item.name === 'Unknown'}
            isOpen={(isHovered || isClicked) && sharedItemId === itemId}
            placement={bottom ? 'top' : reverse ? 'left' : 'right'}
            className={`rounded block bg-cover bg-black bg-opacity-95 p-3 border border-${item.quality.name.toLowerCase()}`}
            onMouseLeave={() => {
                setIsHovered(false);
                setItemId(itemId);
            }}
            onMouseEnter={() => {
                setIsHovered(true);
                setItemId(itemId);
            }}
            content={
                <ItemDetailedView item={item}/>
            }>
            <div
                onMouseEnter={() => {
                    setIsHovered(true);
                    setItemId(itemId);
                }}
                onMouseLeave={() => {
                    setIsHovered(false);
                    setItemId(itemId);
                }}
                onClick={() => {
                    setIsClicked(!isClicked);
                    setItemId(itemId);
                }}
                className={`w-12 h-12 min-w-12 rounded-lg overflow-hidden border block bg-cover relative`} style={{
                borderColor,
                backgroundImage: `url(${itemIconUrl})`,
            }}>
                {rune &&
                  <div className="absolute bottom-0 right-0 w-6 h-6 rounded-sm border border-black bg-cover"
                       style={{
                           backgroundImage: `url(/runes/${runeKey}.webp)`,
                       }}
                  />
                }
            </div>
        </Tooltip>
    )
}
