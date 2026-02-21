import createServerSession from "@utils/supabase/createServerSession";
import { cookies } from "next/headers";
import NotLoggedInView from "@/app/components/NotLoggedInView";
import { Button } from "@/app/components/Button";
import LootHistoPreview from "@/app/raid/[id]/loot/upload/LootHistoPreview";
import { convertLootCsvToObjects, parseLootCsv } from "@/app/raid/[id]/loot/util";
import { notFound, redirect } from "next/navigation";

export const dynamic = 'force-dynamic'
const requiredPermissions = 'loot_history.create'

async function handleSubmit(formData: FormData) {
	'use server'

	const loot = formData.get('loot')
	const raid_id = formData.get('raid_id')
	if (!loot) {
		return
	}

	if (!raid_id) {
		return
	}
	try {
		const csv = parseLootCsv(loot as string)
		const lootObjects = convertLootCsvToObjects(csv)

		const { getSupabase } = await createServerSession();

		const supabase = await getSupabase();
		const { error } = await supabase
			.from('ev_loot_history')
			.insert(lootObjects.map((loot) => ({
				...loot,
				raid_id
			})))

		if (error) {
			console.error(error)
		}

		redirect(`/raid/${raid_id}/loot`)
	} catch (error) {
		console.error('Error parsing loot csv', error)
	}
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { auth, getSupabase } = await createServerSession();
	const user = await auth.getSession()
	const supabase = await getSupabase();
	const { id: resetId } = await params
	const { data, error } = await supabase.from('raid_resets').select('realm').eq('id', resetId).single()

	if (error) {
		console.error('Error fetching reset info', error)
		return notFound()
	}

	if (!user) {
		return <NotLoggedInView />
	}

	if (!user.permissions.includes(requiredPermissions)) {
		return <div>Not authorized</div>
	}

	return (
		<form className="flex flex-col gap-4 w-full h-full" action={handleSubmit}>
			<input type="hidden" name="raid_id" value={resetId} />
			<div className="flex h-[90%] w-full">
				<LootHistoPreview reset_id={resetId} realm={data.realm} />
			</div>
			<Button type="submit" className="mt-4">
				Submit
			</Button>
		</form>
	)
}
