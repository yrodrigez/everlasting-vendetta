import {type Reservation} from "@/app/raid/[id]/soft-reserv/types";
import {Spinner, Tooltip} from "@heroui/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash} from "@fortawesome/free-solid-svg-icons";

export function ReservedItem({reservation, belongsToLogged, remove, reservationsOpen, loading, showTooltip = true}: {
    reservation: Reservation,
    belongsToLogged?: boolean,
    remove?: (itemId: number) => Promise<void>
    reservationsOpen: boolean
    loading: boolean
    showTooltip?: boolean
}) {
    const {icon, name, quality} = reservation?.item?.description ?? {}
    const item = reservation?.item?.description ?? {}
    const qualityColor = [
        'poor',
        'common',
        'uncommon',
        'rare',
        'epic',
        'legendary',
    ][quality ?? 0] ?? 'common'

    return (
        (<div className="flex items-center justify-between p-2 rounded-md">
            <Tooltip
                className="bg-transparent border-none shadow-none"
                content={(
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
                )}>
                <div className="relative group">
                    <img
                        className={`border-${qualityColor} border rounded-md`}
                        src={icon} alt={name} width={36} height={36}/>
                    {belongsToLogged && reservationsOpen && remove && (

                        <div
                            className={'hidden group-hover:flex absolute top-0 right-0 bg-black bg-opacity-50 bottom-0 left-0 text-xs rounded-md text-red-500 hover:cursor-pointer items-center justify-center'}
                            onClick={() => !loading ? remove(reservation?.item?.id) : null}
                        >
                            {loading ? <Spinner size="sm"/> : <FontAwesomeIcon icon={faTrash}/>}
                        </div>

                    )}
                </div>
            </Tooltip>
        </div>)
    );

}
