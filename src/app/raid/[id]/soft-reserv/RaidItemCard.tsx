import {Character, RaidItem} from "@/app/raid/[id]/soft-reserv/types";
import {useWoWZamingCss} from "@/app/hooks/useWoWZamingCss";
import Image from "next/image";
import {useEffect, useRef, useState} from "react";
import {Button, Modal, ModalContent, Tooltip} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faBan,
    faCartPlus,
    faCheck,
    faClose, faLock,
    faObjectGroup,
    faTrash,
    faUserGroup
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import useScreenSize from "@/app/hooks/useScreenSize";

export const ItemTooltip = ({item, qualityColor}: {
    item: RaidItem,
    qualityColor: 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}) => {

    return <div
        className={`flex gap-2 relative`}>
        <Image src={item.description.icon} alt={item.name} width={40} height={40}
               className={`max-h-[40px] max-w-[40px] w-[40px] h-[40px] border border-${qualityColor} rounded absolute top-0 -left-10 ${item.isHardReserved ? 'grayscale' :''}`}/>
        <div
            className={`bg-black border border-${qualityColor} rounded max-w-64 p-2 select-none`}
            dangerouslySetInnerHTML={{
                __html: item.description.tooltip.replaceAll(/<a/g, '<span').replaceAll(/<\/a/g, '</span')
            }}/>
    </div>
}

const ReservedByList = ({reservedBy}: { reservedBy: Character[] }) => {
    return <div
        className={`flex flex-col gap-2 w-full h-full`}>
        <h1 className="text-lg font-bold">Reserved by:</h1>
        <div className="flex flex-col gap-2 w-full h-full overflow-auto scrollbar-pill">
            {reservedBy.map((character) => (
                <Link
                    href={`/roster/${encodeURIComponent(character.name.toLowerCase())}`}
                    target={'_blank'}
                    className="flex justify-between items-center gap-2 p-2 min-w-56">
                    <Image
                        key={character.id}
                        src={character.avatar ?? '/avatar-anon.png'}
                        alt={character.name}
                        width={36}
                        height={36}
                        className={`border-gold border rounded-md`}
                    />
                    <span className="text-sm font-bold">{character.name}</span>
                </Link>
            ))}
        </div>
    </div>
}

export function RaidItemCard({
                                 item,
                                 reserve,
                                 remove,
                                 reservedBy,
                                 isClicked,
                                 setIsClicked,
                                 hardReserve,
                                 removeHardReserve,
    isLoading
                             }: {
    item: RaidItem,
    reserve?: (itemId: number) => Promise<void>,
    remove?: (itemId: number) => Promise<void>
    hardReserve?: (itemId: number) => Promise<void>
    removeHardReserve?: (itemId: number) => Promise<void>
    reservedBy?: Character[]
    isClicked: boolean,
    setIsClicked: (itemId: number) => void
    isLoading: boolean
}) {
    const [showReservedBy, setShowReservedBy] = useState(false)
    const qualityColors = [
        'poor',
        'common',
        'uncommon',
        'rare',
        'epic',
        'legendary',
    ]
    const qualityColor = (qualityColors[item.description.quality ?? 0] || 'common') as 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
    useWoWZamingCss()
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isClicked) {
            setShowReservedBy(false)
        }
    }, [isClicked]);

    const TooltipContent = () => {
        return (<div
            ref={ref}
            className={`flex items-center justify-center gap-2 bg-gradient-${item.isHardReserved ? 'poor': qualityColor} border-${qualityColor} p-2 rounded min-h-64 w-full h-full`}
        >
            {showReservedBy ? <ReservedByList reservedBy={reservedBy ?? []}/> : <>
                <div className="w-8"/>
                <div className="flex flex-col gap-2">
                    {item.isHardReserved ?
                        <div className="text-xs font-bold text-center text-gray-800 transition-all flex items-center gap-2 justify-center">
                            <div>This item is hard reserved</div>
                            <span
                                className="animate-pulse text-red-500"
                            >
                                <FontAwesomeIcon icon={faLock}/>
                            </span>
                        </div> : null}
                    <ItemTooltip
                        qualityColor={qualityColor}
                        item={item}
                    />
                </div>
            </>}
            <div className={
                `flex flex-col gap-2 h-full w-12 grow-1 overflow-y-auto justify-between items-center min-h-52`
            }>
                <div className="flex flex-col gap-2 h-fit"><Button
                    isIconOnly
                    variant="light"
                    className={`text-default rounded`}
                    onClick={() => {
                        setIsClicked(0)
                    }}
                ><FontAwesomeIcon icon={faClose}/></Button>
                    <Button
                        isIconOnly
                        isDisabled={!reservedBy?.length}
                        className={'text-default rounded'}
                        variant={'light'}
                        onClick={() => setShowReservedBy(!showReservedBy)}
                    >
                        {showReservedBy ? <FontAwesomeIcon icon={faObjectGroup}/> :
                            <FontAwesomeIcon icon={faUserGroup}/>}
                    </Button>
                </div>
                <div className="flex flex-col gap-2 h-fit">
                    {hardReserve && !item.isHardReserved ? (
                            <Tooltip content={'Hard reserve'}>
                                <Button
                                    onClick={() => {
                                        hardReserve(item.id).then(() => {
                                        })
                                    }}
                                    isIconOnly
                                    className={`bg-red-600 text-default rounded border border-red-700`}
                                    isDisabled={isLoading}
                                    isLoading={isLoading}
                                >
                                    <FontAwesomeIcon icon={faBan}/>
                                </Button>
                            </Tooltip>)
                        : null}
                    {removeHardReserve && item.isHardReserved ? (
                            <Tooltip content={'Remove hard reserve'}>
                                <Button
                                    onClick={() => {
                                        removeHardReserve(item.id).then(() => {
                                        })
                                    }}
                                    isIconOnly
                                    isDisabled={isLoading}
                                    isLoading={isLoading}
                                    className={`bg-green-500 text-default rounded border border-moss`}
                                >
                                    <FontAwesomeIcon icon={faCheck}/>
                                </Button>
                            </Tooltip>
                        )
                        : null}
                    {remove ? (<Button
                        onClick={() => {
                            remove(item.id).then(() => {

                            })
                        }}
                        isIconOnly
                        isDisabled={isLoading}
                        className={`bg-red-600 text-default rounded border border-red-700`}
                    >
                        <FontAwesomeIcon icon={faTrash}/>
                    </Button>) : null}
                    {reserve && !item.isHardReserved ? (<Button
                            onClick={() => {
                                reserve(item.id).then(() => {
                                })
                            }}
                            isDisabled={isLoading}
                            isIconOnly
                            className={`bg-moss text-default rounded border border-moss-100`}
                        >
                            <FontAwesomeIcon icon={faCartPlus}/>
                        </Button>)
                        : null}
                </div>
            </div>
        </div>)
    }

    return (
        <>
            <div
                onClick={() => {
                    setIsClicked(item.id)
                }}
                className={`flex justify-center p-2 mt-4 rounded-md w-40 lg:w-32 h-24 bg-gradient-to-b border-2 border-${item.isHardReserved ? 'poor': qualityColor} transition-all cursor-pointer bg-gradient-${item.isHardReserved ? 'poor': qualityColor}`}>
                <div className="relative flex flex-col gap-2 items-center justify-center pt-6">
                    <Image src={item.description.icon} alt={item.name}
                           width={46} height={46}
                           className={`absolute -top-5 rounded-md border border-${qualityColor} min-w-10 max-w-10 min-h-10 max-h-10 ${item.isHardReserved ? 'grayscale' :''}`}
                    />
                    <span className="text-xs font-bold">{item.name}</span>
                    {
                        item.isHardReserved ?
                        <div className="text-[.5em] font-bold text-center text-gray-800 transition-all flex items-center gap-2 justify-center absolute -bottom-2">
                            <div>Hard Reserved</div>
                            <span className="animate-pulse text-red-500"><FontAwesomeIcon icon={faLock}/></span>
                        </div> : null
                    }
                </div>
            </div>
            <Modal
                placement="center"
                isOpen={isClicked}
                scrollBehavior={'outside'}
                size={'sm'}
                hideCloseButton={true}
            >
                <ModalContent>
                    {() => <TooltipContent/>}
                </ModalContent>
            </Modal>
        </>
    )
}
