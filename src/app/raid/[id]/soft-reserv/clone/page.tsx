import createServerSession from "@/app/util/supabase/createServerSession"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ROLE } from "@utils/constants";
import { RaidResetCard } from "@/app/calendar/components/RaidResetCard";
import moment from "moment";
import CloneReservesCard from "@/app/raid/[id]/soft-reserv/clone/CloneReservesCard";

const { ADMIN, RAID_LEADER, LOOT_MASTER } = ROLE
const ALLOWED_ROLES = [ADMIN, RAID_LEADER, LOOT_MASTER]

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id: resetId } = await params
    const { getSupabase, auth } = await createServerSession();  
    const user = await auth.getSession()

    if (!user) {
        redirect(`/login?redirect=/raid/${resetId}/soft-reserv/clone`)
    }

    if (!user.isAdmin || !user.roles.some(p => ALLOWED_ROLES.includes(p))) {
        return <div
            className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">Unauthorized</h1>
            <p>You are not authorized to view this page</p>
            <p>Please contact an admin</p>
        </div>
    }

    const supabase = await getSupabase();
    const {
        data: reset,
        error: resetFetchError
    } = await supabase
        .from('raid_resets')
        .select('id, name, startDate: raid_date, endDate: end_date, startTime: time, endTime: end_time, raid:ev_raid(name, id, image)')
        .eq('id', resetId)
        .single()
        .overrideTypes<{
            id: string,
            name: string,
            startDate: string,
            endDate: string,
            startTime: string,

            endTime: string,
            raid: {
                id: string,
                name: string,
                image: string
            }
        }>()

    if (resetFetchError || !reset) {
        console.error(resetFetchError)
        return <div
            className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">Error</h1>
            <p>Could not fetch reset</p>
        </div>
    }


    const raid = reset.raid
    const { data: resetsToCloneFrom, error: raidResetsError } = await supabase
        .from('raid_resets')
        .select('id, name, raid_date, raid:ev_raid(name, id, image), reserves:raid_loot_reservation!inner(member_id, item_id)')
        .eq('raid_id', raid.id)
        .neq('id', resetId)
        .order('raid_date', { ascending: false })
        .overrideTypes<{
            id: string,
            name: string,
            raid_date: string,
            raid: {
                id: string,
                name: string,
                image: string
            },
            reserves: {
                member_id: number,
                item_id: number,
            }[]
        }[]>()

    if (raidResetsError || !resetsToCloneFrom) {
        console.error(raidResetsError)
        return <div
            className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">Error</h1>
            <p>Could not fetch resets</p>
        </div>

    }


    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex flex-col items-center justify-center w-full max-h-[256px]">
                <RaidResetCard
                    raidImage={`/${raid.image}`}
                    raidName={raid.name}
                    raidDate={moment(reset.startDate).format('YYYY-MM-DD') ?? moment().format('YYYY-MM-DD')}
                    raidEndDate={moment(reset.endDate).format('YYYY-MM-DD') ?? moment().add(7, 'days').format('YYYY-MM-DD')}
                    raidTime={reset.startTime}
                    raidRegistrations={[]}
                    endTime={reset.endTime}
                />
            </div>
            <div className="flex flex-col items-center justify-center w-full pt-4">
                <h1 className="text-2xl font-bold">Cloning from previous resets</h1>
                <p className="text-gray-500">Select the reset you want to clone reserves from from</p>
            </div>
            <div className="flex justify-center w-full h-full gap-4 p-4 flex-wrap overflow-auto scrollbar-pill">
                {
                    resetsToCloneFrom.filter(x => x.reserves.length).map((reset) => {
                        return <CloneReservesCard
                            key={reset.id}
                            originalResetId={resetId}
                            reset={{
                                name: reset.name,
                                id: reset.id,
                                image: reset.raid.image,
                                date: reset.raid_date,
                            }}
                            reserves={reset.reserves}
                        />
                    })
                }
            </div>
        </div>
    )
}