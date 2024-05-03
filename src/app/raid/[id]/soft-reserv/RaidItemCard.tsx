import {Character, RaidItem} from "@/app/raid/[id]/soft-reserv/types";
import {useWoWZamingCss} from "@/app/hooks/useWoWZamingCss";
import Image from "next/image";
import {useEffect, useRef, useState} from "react";
import {Button, Tooltip} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCartPlus, faClose, faObjectGroup, faTrash, faUserGroup} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const ItemTooltip = ({item, qualityColor}: {
    item: RaidItem,
    qualityColor: 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}) => {

    return <div
        className={`flex gap-2`}>
        <Image src={item.description.icon} alt={item.name} width={40} height={40}
               className={`max-h-[40px] max-w-[40px] w-[40px] h-[40px] border-${qualityColor} rounded`}/>
        <div
            className={`bg-black border border-${qualityColor} rounded max-w-64 p-2`}
            dangerouslySetInnerHTML={{
                __html: item.description.tooltip
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

export function RaidItemCard({item, reserve, remove, reservedBy, isClicked, setIsClicked}: {
    item: RaidItem,
    reserve?: (itemId: number) => Promise<void>,
    remove?: (itemId: number) => Promise<void>
    reservedBy?: Character[]
    isClicked: boolean,
    setIsClicked: (itemId: number) => void
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
    const [widthAndHeight, setWidthAndHeight] = useState({width: 0, height: 0})

    useEffect(() => {
        if (ref.current) {
            if (widthAndHeight.width === ref.current.clientWidth && widthAndHeight.height === ref.current.clientHeight) return
            const currentHeight = ref.current.clientHeight + 20
            const currentWidth = ref.current.clientWidth
            if (currentHeight > widthAndHeight.height || currentWidth > widthAndHeight.width) {
                setWidthAndHeight({
                    width: currentWidth,
                    height: currentHeight + 20
                })
            }
        }
    }, [ref.current, isClicked]);

    useEffect(() => {
        if (!isClicked) {
            setShowReservedBy(false)
        }
    }, [isClicked]);

    return (
        <Tooltip
            className={`bg-transparent h-fit shadow-none border-none`}
            showArrow
            // @ts-ignore - shadow-none is in the types
            shadow="none"
            content={<div
                ref={ref}
                className={`flex gap-2 bg-gradient-${qualityColor} border-${qualityColor} p-2 rounded h-full min-h-64`}
                style={
                    widthAndHeight.width && widthAndHeight.height ?
                        {
                            width: widthAndHeight.width,
                            height: widthAndHeight.height
                        } : {}}
            >
                {showReservedBy ? <ReservedByList reservedBy={reservedBy ?? []}/> : <ItemTooltip
                    qualityColor={qualityColor}
                    item={item}
                />}
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
                        {reserve ? (<Button
                                onClick={() => {
                                    reserve(item.id).then(() => {
                                    })
                                }}
                                isIconOnly
                                className={`bg-moss text-default rounded border border-moss`}
                            >
                                <FontAwesomeIcon icon={faCartPlus}/>
                            </Button>)
                            : null}
                        {remove ? (<Button
                            onClick={() => {
                                remove(item.id).then(() => {

                                })
                            }}
                            isIconOnly
                            className={`bg-red-600 text-default rounded border border-moss`}
                        >
                            <FontAwesomeIcon icon={faTrash}/>
                        </Button>) : null}
                    </div>
                </div>
            </div>}
            placement="top"
            isOpen={isClicked}
        >
            <div
                onClick={() => {
                    setIsClicked(item.id)
                }}
                className={`flex justify-center p-2 mt-4 rounded-md w-32 h-24 bg-gradient-to-b border-2 border-${qualityColor} transition-all cursor-pointer bg-gradient-${qualityColor}`}>
                <div className="relative flex flex-col gap-2 items-center justify-center pt-6">
                    <Image src={item.description.icon} alt={item.name}
                           width={46} height={46}
                           className={`absolute -top-5 rounded-md border border-${qualityColor} min-w-10 max-w-10 min-h-10 max-h-10`}
                    />
                    <span className="text-xs font-bold">{item.name}</span>
                </div>
            </div>
        </Tooltip>
    )
}
