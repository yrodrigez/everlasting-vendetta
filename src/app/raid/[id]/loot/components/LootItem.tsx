'use client'
import CharacterAvatar from "@/app/components/CharacterAvatar";
import { useWoWZamingCss } from "@/app/hooks/useWoWZamingCss";
import { type CharacterWithLoot, type Item } from "@/app/raid/[id]/loot/components/types";
import { faMasksTheater, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal, ModalContent, Tooltip, useDisclosure } from "@heroui/react";
import { useMemo } from "react";

export const ItemWithTooltip = ({ item, className }: { item: Item, className?: string }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const qualityColor = useMemo(() => typeof item.quality === 'number' ? [
        'poor',
        'common',
        'uncommon',
        'rare',
        'epic',
        'legendary',
    ][item.quality] : item.quality?.name?.toLowerCase() || 'common', [item.quality]);

    return (<>
        <Tooltip
            className={`bg-black border border-${qualityColor} rounded-lg max-w-64`}
            isDisabled={!item.isPlus && !item.offspec}
            content={
                item.isPlus ? 'Plus'
                    : item.offspec ? 'Offspec'
                        : 'Main spec'
            }
            placement="top"
            showArrow
        >
            <div className="relative cursor-pointer"
                onClick={onOpen}
            >
                <img
                    className={`rounded-lg border border-${qualityColor} block bg-cover min-h-10 min-w-10 ${className}`}
                    src={item.icon} width={36} height={36} alt={item.name}
                />
                {(item.isPlus || item.offspec) && <div
                    className={`absolute -top-1 -right-1 text-gold border-gold border px-1 rounded-full text-xs bg-dark`}>
                    <FontAwesomeIcon icon={item.isPlus ? faPlus : faMasksTheater} />
                </div>
                }
            </div>
        </Tooltip>
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className={`bg-transparent border-none shadow-none`}
        >
            <ModalContent>
                {() =>
                    <div className={`flex gap-2 p-2`}>
                        <img
                            className={`rounded-lg border border-${qualityColor} block bg-cover max-h-10 max-w-10 min-h-10 min-w-10 `}
                            src={item.icon} width={36} height={36} alt={item.name}
                        />
                        <div
                            className={`w-96 border border-${qualityColor} rounded-lg p-2 bg-dark bg-blend-color select-none`}
                            dangerouslySetInnerHTML={{ __html: item?.tooltip?.replaceAll(/<a/g, '<span').replaceAll(/<\/a>/g, '</span>') || '' }}
                        />
                    </div>
                }
            </ModalContent>
        </Modal>
    </>);
}

export function LootItem({ characterWithLoot }: { characterWithLoot: CharacterWithLoot }) {
    useWoWZamingCss() // This is a custom hook that loads the WoW Zaming CSS
    return (
        <div className={`rounded-lg flex flex-col gap-2 pt-2 items-center border border-gold w-64 bg-dark relative`}>
            {characterWithLoot.plusses > 0 && (
                <div
                    className={`absolute top-1 right-1 bg-transparent text-gold border-gold border py-1 px-2 rounded-full text-xs`}>
                    {characterWithLoot.plusses}
                </div>
            )}
            <CharacterAvatar width={60} height={60} characterName={characterWithLoot.character.toLowerCase()} realm={characterWithLoot.realm.toLowerCase()} />
            <span className="text-sm font-semibold">{characterWithLoot.character}</span>
            <div className={`flex gap-2 p-2 m-2 overflow-auto scrollbar-pill w-full justify-around border-2 border-transparent`}>
                {characterWithLoot.loot.map((item, i) => {
                    return <ItemWithTooltip key={item.id} item={{ ...item.item, id: item.itemID, isPlus: item.isPlus, offspec: item.offspec === 1 }} />
                })}
            </div>
        </div>

    )
}
