import createServerSession from "@/app/util/supabase/createServerSession";
import {cookies} from "next/headers";
import NotLoggedInView from "@/app/components/NotLoggedInView";
import getResetById from "@/app/calendar/api/getResetById";
import RaidsSelector from "@/app/calendar/new/Components/RaidsSelector";
import StartDate from "@/app/calendar/new/Components/StartDate";
import TimeManager from "@/app/calendar/new/Components/TimeManager";
import {DaysSelection} from "@/app/calendar/new/Components/DaysSelection";
import {RaidCard} from "@/app/calendar/new/Components/RaidCard";
import {CreateRaidButton} from "@/app/calendar/new/Components/CreateRaidButton";
import getAvailableRaids from "@/app/calendar/api/getAvailableRaids";
import {ResetCRUDStoreManager} from "@/app/calendar/[id]/edit/ResetCRUDStoreManager";
import {EditRaidButton} from "@/app/calendar/[id]/edit/EditRaidButton";

export default async function Page({params}: { params: { id: string } }) {
    const {supabase, auth} = createServerSession({cookies})
    const user = await auth.getSession()
    if (!user) {
        return <NotLoggedInView/>
    }

    if (!user.permissions.some(p => p === 'reset.edit')) {
        return <div>Not enough permissions</div>
    }

    const reset = await getResetById(params.id, supabase)
    const raids = await getAvailableRaids(supabase)

    return (
        <ResetCRUDStoreManager reset={reset}>
            <div className="flex flex-col gap-8 w-full h-full p-2 scrollbar-pill">
                <div className="flex flex-col lg:flex-row gap-2 w-full overflow-auto">
                    <div
                        className="flex w-full gap-2 items-center lg:items-start flex-col">
                        <RaidsSelector raids={raids || []}/>
                        <div className="flex w-full justify-between max-w-[400px] gap-2 flex-col">
                            <StartDate/>
                            <TimeManager/>
                        </div>
                        <DaysSelection/>
                    </div>
                    <div
                        className="flex  justify-between gap-2 items-center lg:items-start lg:justify-end flex-col lg:flex-row">
                        <RaidCard/>
                    </div>
                </div>
                <EditRaidButton reset={reset}/>
            </div>
        </ResetCRUDStoreManager>
    )
}