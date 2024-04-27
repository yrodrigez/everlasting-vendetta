import {type RaidItem} from "@/app/calendar/components/RaidItemsList";
import Image from "next/image";
import Link from "next/link";
import {useReservationsStore} from "@/app/calendar/components/reservationStore";
import {useEffect, useRef, useState} from "react";
import {Tooltip} from "@nextui-org/react";
import {useWoWZamingCss} from "@/app/hooks/useWoWZamingCss";

const qualityColors = [
    'poor',
    'common',
    'uncommon',
    'rare',
    'epic',
    'legendary',
]

export default function RaidItem({item}: { item: RaidItem }) {
    const {addItem, removeItem} = useReservationsStore()
    const reservedItems = useReservationsStore(state => state.items)
    const ref = useRef(null)
    const [itemData, setItemData] = useState({tooltip: '', quality: 0})
    const [qualityColor, setQualityColor] = useState('common')

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    if (itemData.tooltip) {
                        return
                    }

                    (async () => {
                        const fetchUrl = `https://nether.wowhead.com/tooltip/item/${item.id}?dataEnv=4&locale=0`
                        const response = await fetch(fetchUrl)
                        const data = await response.json()
                        setItemData(data)
                        setQualityColor(qualityColors[data.quality] || 'common')
                    })()
                }
            });
        });

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [item.id, itemData.tooltip, itemData.quality]);

    useWoWZamingCss()

    return (
        <Tooltip
            className={`bg-black border border-${qualityColor} rounded max-w-64`}
            content={
                <div
                    dangerouslySetInnerHTML={{__html: itemData.tooltip || ''}}
                />
            }
            placement="right"
        >
            <div
                ref={ref}
                className={`border flex items-center gap-2 p-2 rounded-lg  transition-all cursor-pointer ${reservedItems.find(x => x.id === item.id) ? 'bg-gold text-wood' : 'bg-wood/80 hover:bg-wood'}`}
                onClick={() => {
                    if (reservedItems.find(x => x.id === item.id)) {
                        removeItem(item)
                    } else {
                        addItem(item)
                    }
                }}
            >
                <Image
                    className={`rounded-lg border border-${qualityColor} block bg-cover relative`}
                    src={item.image} width={48} height={48} alt={item.name}
                />
                <div className="flex flex-col">
                    <Link
                        data-wowhead={`domain=classic&item=${item.id}`}
                        target="_blank"
                        href={`https://www.wowhead.com/classic/item=${item.id}`}>
                        <div className={`whitespace-pre p-1 underline text-${qualityColor}`}>{item.name}</div>
                    </Link>
                    <div className="whitespace-pre p-1">{item.raid}</div>
                </div>
            </div>
        </Tooltip>
    )
}
