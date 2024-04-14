import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";

import RaidItemsList from "@/app/calendar/components/RaidItemsList";
import ReservedItems from "@/app/calendar/components/ReservedItems";


export default async function Reservations() {
    const token = cookies().get(process.env.BNET_COOKIE_NAME!)?.value
    if (!token) {
        return <div>Not logged in</div>
    }
    const database = createServerComponentClient({cookies})
    const databaseItems = await database.from('raid_loot_item')
        .select('*, raid:ev_raid(name, id, min_level)')

    const items = (databaseItems.data ?? []).map((item: any) => {
        return {
            name: item.name,
            description: item.description,
            id: item.id,
            image: item.description.imageUrl,
            raid: item.raid?.name,
            minLevel: item.raid?.min_level
        }
    })

    return (
        <div className="w-full flex h-full justify-between gap-52">
            <RaidItemsList items={items}/>
            <ReservedItems/>
        </div>
    )
}
