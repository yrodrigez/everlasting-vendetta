'use client'
import {ItemDetails} from "@/app/components/CharacterItem";
import {Button, Modal, ModalBody, ModalContent, Tooltip, useDisclosure} from "@heroui/react";

import {ItemDetailedView} from "@/app/roster/[name]/components/ItemDetailedView";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClose} from "@fortawesome/free-solid-svg-icons";
import {itemTypeInfo} from "@/app/roster/[name]/ilvl";

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


    const [_, isEnchantable] = itemTypeInfo[`INVTYPE_${item.inventory_type?.type}`] ?? [0, false];
    const isEnchanted = item.enchantments?.filter((enchant: any) => enchant.enchantment_slot.type !== 'TEMPORARY').length && isEnchantable

    const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure()
    return (
        <>
            <Tooltip
                isDisabled={item.name === 'Unknown'}
                placement={bottom ? 'top' : reverse ? 'left' : 'right'}
                className={`rounded block bg-cover bg-black bg-opacity-95 p-3 border border-${item.quality.name.toLowerCase()}`}
                content={
                    <ItemDetailedView item={item}/>
                }>
                <div
                    className={`w-12 h-12 min-w-12 rounded-lg overflow-hidden border block bg-cover relative cursor-pointer z-50`}
                    onClick={onOpen} style={{
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
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                onOpenChange={onOpenChange}
                className="bg-transparent"
                scrollBehavior="outside"
                size="xl"
                closeButton={<Button
                    isIconOnly
                    variant="light"
                    size="sm"
                >
                    <FontAwesomeIcon icon={faClose}/>
                </Button>}
            >
                <ModalContent>
                    {() =>
                        <ModalBody>
                            <div className="flex gap-1">
                                <div
                                    className={`w-12 h-12 min-w-12 rounded-lg overflow-hidden border block bg-cover relative cursor-pointer`}
                                    style={{
                                    borderColor,
                                    backgroundImage: `url(${itemIconUrl})`,
                                }}>
                                    {rune &&
                                      <div
                                        className="absolute bottom-0 right-0 w-6 h-6 rounded-sm border border-black bg-cover"
                                        style={{
                                            backgroundImage: `url(/runes/${runeKey}.webp)`,
                                        }}
                                      />
                                    }
                                </div>
                                <div className="bg-dark border border-gold p-2 rounded">
                                    <ItemDetailedView item={item}/>
                                </div>
                            </div>
                        </ModalBody>
                    }
                </ModalContent>
            </Modal>
        </>
    )
}
