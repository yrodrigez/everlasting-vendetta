import createServerSession from "@utils/supabase/createServerSession";
import {cookies} from "next/headers";
import NotLoggedInView from "@/app/components/NotLoggedInView";
import {Button} from "@/app/components/Button";
import LootHistoPreview from "@/app/raid/[id]/loot/upload/LootHistoPreview";
import {convertLootCsvToObjects, parseLootCsv} from "@/app/raid/[id]/loot/util";
import {redirect} from "next/navigation";

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

        const {supabase} = createServerSession({cookies})

        const {error} = await supabase
            .from('ev_loot_history')
            .insert(lootObjects.map((loot) => ({
                ...loot,
                raid_id
            })))

        if (error) {
            console.error(error)
        } else {
            redirect(`/raid/${raid_id}/loot`)
        }
    } catch (error) {
        console.error('Error parsing loot csv', error)
    }
}

export default async function Page({params}: { params: { id: string } }) {
    const {auth} = createServerSession({cookies})
    const user = await auth.getSession()

    if (!user) {
        return <NotLoggedInView/>
    }

    if (!user.permissions.includes(requiredPermissions)) {
        return <div>Not authorized</div>
    }

    return (
        <form
            className="flex flex-col gap-4 w-full h-full"
            action={handleSubmit}
        >
            <input type="hidden" name="raid_id" value={params.id}/>
            <div className="flex h-[90%] w-full">
                <LootHistoPreview reset_id={params.id}/>
            </div>
            <Button type="submit" className="mt-4">
                Submit
            </Button>
        </form>
    )
}
