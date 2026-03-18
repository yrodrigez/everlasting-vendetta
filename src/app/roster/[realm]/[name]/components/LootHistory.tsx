'use client'
import { Button } from "@/components/Button";
import WoWHeadItem from "@/components/wow-head-item";
import { useAuth } from "@/context/AuthContext";
import { useMessageBox } from '@/util/msgBox';
import { useSupabase } from "@/context/SupabaseContext";
import { ScrollShadow } from "@heroui/react";
import { Trash2Icon } from "lucide-react";
import moment from "moment/moment";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";


export function LootHistory({ lootHistory }: {
	lootHistory: Record<string, {
		date: string
		items: { itemId: number, id: string }[]
		reset?: { name: string } | null
		name?: string
		resetId?: string
	}>;
}) {
	if (!lootHistory || !Object.values(lootHistory)?.length) {
		return <div>
			No loot history found
		</div>
	}

	const lootData = Object.values(lootHistory).sort((a: any, b: any) => {
		return moment(a.date).isBefore(moment(b.date)) ? 1 : -1
	})


	const { user } = useAuth()
	const supabase = useSupabase();

	const isDeletePermission = useMemo(() => {
		if (!user) return false;
		return user.isAdmin || user.permissions?.includes('loot_history.delete');
	}, [user]);

	const router = useRouter();
	const { yesNo, alert } = useMessageBox();

	const handleDelete = useCallback(async (id: string) => {
		if (!supabase || !isDeletePermission) return;
		const confirmed = await yesNo({
			title: 'Delete Loot Item',
			message: 'Are you sure you want to delete this loot item? This action cannot be undone.',
			yesText: 'Yes, Delete',
			noText: 'No',
		});
		if (confirmed !== 'yes') return;
		const { error } = await supabase.from('ev_loot_history')
			.delete()
			.eq('id', id)
		if (error) {
			alert({
				title: 'Error',
				message: 'An error occurred while deleting the loot item. Please try again later.',
				type: 'error',
			});
			console.error('Error deleting loot item:', error);
		}

		router.refresh();
	}, [supabase, user, isDeletePermission]);

	return (
		<div className="flex flex-col bg-wood border border-wood-100 text-gold p-4 h-full min-h-0 px-6 rounded gap-6">
			<ScrollShadow className="scrollbar-pill flex-1 min-h-0">
				{lootData.map((reset, index) => {
					return <div key={index} className={`flex flex-col gap-2 ${index ? 'mt-6' : ''}`}>
						<div className="flex gap-2 items-center">
							<h4 className="text-gold text-lg">{reset.reset?.name ?? reset.name}</h4>
							<small className="text-primary">( {moment(reset.date).format('YYYY-MM-DD')} )</small>
						</div>
						<div className="flex flex-col gap-1">
							{
								reset.items.map((item: any, index: number) => {
									return <div key={index} className="flex">
										<WoWHeadItem itemId={item.itemId} className="flex gap-2 items-center" iconSize="medium" />
										{isDeletePermission && <Button isIconOnly variant="light" onPress={() => handleDelete(item.id)} className="ml-auto text-red-500 hover:text-red-700 transition-colors">
											<Trash2Icon />
										</Button>}
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
