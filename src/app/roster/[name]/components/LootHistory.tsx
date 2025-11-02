'use client'
import moment from "moment/moment";
import { ItemWithTooltip } from "@/app/raid/[id]/loot/components/LootItem";
import { useEffect, useState } from "react";
import { ScrollShadow, Spinner } from "@heroui/react";
import { useWoWZamingCss } from "@/app/hooks/useWoWZamingCss";
import api from "@/app/lib/api";

const fetchItemDataById = async (itemId: string) => {
	const { data } = await api.get(`/wow/item/${itemId}`);
	return data.itemDetails;
}

function Item({ id }: { id: string | number }) {
	const [item, setItem] = useState<any>(null)
	const [loading, setLoading] = useState(true)
	useWoWZamingCss()
	useEffect(() => {
		fetchItemDataById(id.toString()).then((item) => {
			setItem(item)
		}).finally(() => {
			setLoading(false)
		})
	}, []);

	return loading ? <Spinner /> : <div className="flex gap-2">
		<ItemWithTooltip item={item} />
		<span className="text-primary self-end">{item.name}</span>
	</div>

}

export function LootHistory({ lootHistory }: {
	lootHistory: any
}) {
	if (!lootHistory || !Object.values(lootHistory)?.length) {
		return <div>
			No loot history found
		</div>
	}

	const lootData = Object.values(lootHistory).sort((a: any, b: any) => {
		return moment(a.date).isBefore(moment(b.date)) ? 1 : -1
	})

	return (
		<div className="flex flex-col bg-wood border border-wood-100 text-gold p-4 max-h-96 px-6 rounded gap-6">
			<ScrollShadow className="scrollbar-pill">
				{lootData.map((reset: any, index: number) => {
					return <div key={index} className={`flex flex-col gap-2 ${index ? 'mt-6' : ''}`}>
						<div className="flex gap-2 items-center">
							<h4 className="text-gold text-lg">{reset.reset.name ?? reset.name}</h4>
							<small className="text-primary">( {moment(reset.date).format('YYYY-MM-DD')} )</small>
						</div>
						<div className="flex flex-col gap-1">
							{
								reset.items.map((item: any, index: number) => {
									return <div key={index} className="flex">
										<Item id={item.id} />
									</div>
								})
							}
						</div>
					</div>
				})}
			</ScrollShadow>
		</div>
	)
}
