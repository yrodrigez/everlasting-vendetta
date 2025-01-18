'use client'
import {type CharacterWithLoot, type Item} from "@/app/raid/[id]/loot/components/types";
import {useWoWZamingCss} from "@/app/hooks/useWoWZamingCss";
import Image from "next/image";
import Link from "next/link";
import {Modal, ModalContent, Skeleton, Tooltip, useDisclosure} from "@nextui-org/react";
import {faMasksTheater, faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useQuery} from "@tanstack/react-query";

export const ItemWithTooltip = ({item}: { item: Item }) => {
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure()
    const qualityColor = [
        'poor',
        'common',
        'uncommon',
        'rare',
        'epic',
        'legendary',
    ][item.quality]
    return (
        <>
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
                    <Image
                        className={`rounded-lg border border-${qualityColor} block bg-cover  min-h-10 min-w-10`}
                        src={item.icon} width={36} height={36} alt={item.name}
                    />
                    {(item.isPlus || item.offspec) && <div
                      className={`absolute -top-1 -right-1 text-gold border-gold border px-1 rounded-full text-xs bg-dark`}>
                      <FontAwesomeIcon icon={item.isPlus ? faPlus : faMasksTheater}/>
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
                                dangerouslySetInnerHTML={{__html: item.tooltip.replaceAll(/<a/g, '<span').replaceAll(/<\/a>/g, '</span>') || ''}}
                            />
                        </div>
                    }
                </ModalContent>
            </Modal>
        </>
    )
}

const CharacterAvatar = ({characterName}: { characterName: string }) => {

    const {data: characterAvatar, isLoading, error} = useQuery({
        queryKey: ['characterAvatar', characterName],
        queryFn: async () => {
            if (characterName === '_disenchanted') {
                return 'unknown'
            }

            const data = await fetch(`/api/v1/services/member/avatar/get?characterName=${encodeURIComponent(characterName.toLowerCase())}`)
            const response = await data.json()
            return response.avatar
        },
        enabled: characterName !== '_disenchanted',
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    })

    return characterName === '_disenchanted' ? (
        <Tooltip
            className={`bg-black border border-gold rounded max-w-64`}
            content='Disenchanted'
        >
            <div
                className={
                    `flex flex-col items-center gap-2 p-2`
                }
            >
                <img className={`rounded-lg border border-gold`} src={'/disenchant.jpg'}
                       alt={'Disenchanted'} width={64} height={64}/>
                <div className={`whitespace-pre p-1`}>Disenchanted</div>
            </div>
        </Tooltip>
    ) : (
        <Link
            className={
                `flex flex-col items-center p-2`
            }
            href={`/roster/${encodeURIComponent(characterName.toLowerCase())}`}>
            {error ? <span>Error!</span> : (
                <Skeleton isLoaded={!isLoading}
                          className="w-16 h-16 rounded-full border border-gold bg-cover flex items-center justify-center">
                    <img
                        className={`rounded-full border border-gold block bg-cover relative`}
                        src={(characterName === 'unknown' || !characterName || !characterAvatar) ? '/avatar-anon.png' : characterAvatar}
                        width={64}
                        height={64} alt={characterName}
                    />
                </Skeleton>
            )}
            <div className={`whitespace-pre p-1`}>{characterName}</div>
        </Link>
    )
}

export function LootItem({loot}: { loot: CharacterWithLoot }) {
    useWoWZamingCss() // This is a custom hook that loads the WoW Zaming CSS

    return (
        <div className={`rounded-lg flex flex-col gap-2 items-center border border-gold w-64 bg-dark relative`}>
            {loot.plusses > 0 && (
                <div
                    className={`absolute top-1 right-1 bg-transparent text-gold border-gold border py-1 px-2 rounded-full text-xs`}>
                    {loot.plusses}
                </div>
            )}
            <CharacterAvatar characterName={loot.character}/>
            <div className={`flex gap-2 p-2 m-2 overflow-auto scrollbar-pill w-full justify-around border-2 border-transparent`}>
                {loot.loot.map((item, i) => {
                    return <ItemWithTooltip key={item.id} item={{...item.item, id: item.itemID, isPlus: item.isPlus, offspec: item.offspec === 1}}/>
                })}
            </div>
        </div>

    )
}
