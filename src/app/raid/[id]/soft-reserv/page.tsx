import {cookies} from "next/headers";
import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import RaidItemsList from "@/app/raid/[id]/soft-reserv/RaidItemsList";
import {raidLootReservationsColumns} from "@/app/raid/[id]/soft-reserv/supabase_config";
import {Reservation} from "@/app/raid/[id]/soft-reserv/types";
import {getLoggedInUserFromAccessToken} from "@/app/util";
import YourReservations from "@/app/raid/[id]/soft-reserv/YourReservations";
import React from "react";
import AdminPanel from "@/app/raid/[id]/soft-reserv/AdminPanel";
import RaidTimeInfo from "@/app/raid/components/RaidTimeInfo";


export default async function Page({params}: { params: { id: string } }) {
    const token = cookies().get(process.env.BNET_COOKIE_NAME!)?.value
    const evToken = cookies().get(process.env.EV_COOKIE_NAME!)?.value
    if (!token || !evToken) {
        return <div>Not logged in</div>
    }


    const database = createServerComponentClient({cookies}, {
        options: {
            global: {
                headers: {
                    Authorization: `Bearer ${evToken}`
                }
            }
        }
    })

    const resetId = params.id
    const resetData = await database.from('raid_resets')
        .select('raid_id, raid:ev_raid(min_level, name, image), raid_date, time, end_date')
        .eq('id', resetId)
        .single()
    if (!resetData.data) {
        return <div>Reset not found</div>
    }

    const loggedInCharacter = getLoggedInUserFromAccessToken(evToken)

    // @ts-ignore - min_level is a number
    if (resetData.data.raid?.min_level > loggedInCharacter.level) {
        return <div>Character level too low</div>
    }

    const databaseItems = await database.from('raid_loot_item')
        .select('*, raid:ev_raid(name, id, min_level)')
        .eq('raid_id', resetData.data?.raid_id)


    const dataBaseReservations = await database.from('raid_loot_reservation')
        .select(raidLootReservationsColumns)
        .eq('reset_id', resetId)

    const items = (databaseItems.data ?? [])

    const reservations = (dataBaseReservations?.data ?? []) as unknown as Reservation[]
    const {data, error} = await database.from('ev_admin').select('id').eq('id', loggedInCharacter.id).single()

    return (
        <div className="w-full flex-col flex h-full justify-between relative">
            <div
                className={'absolute -top-0 -left-72 w-64 z-10 border-gold border rounded-md'}>
                <div className="relative flex w-full h-full">
                    <div className="absolute flex p-2 rounded-md background-position-center bg-cover w-full h-full"
                         style={{
                             // @ts-ignore - image is a string
                             backgroundImage: `url('/${resetData.data?.raid?.image}')`,
                             backgroundSize: 'cover',
                             backgroundPosition: 'center',
                             filter: 'brightness(35%)'
                         }}/>
                    <div className="flex flex-col w-full h-full justify-between relative p-2">
                        <div className="flex items-center gap-2">
                            {/* @ts-ignore - name is a string */}
                            <span className="text-lg font-bold">{resetData.data?.raid?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <RaidTimeInfo
                                raidDate={resetData.data.raid_date}
                                raidTime={resetData.data.time}
                                raidEndDate={resetData.data.end_date}
                            />
                        </div>
                        <YourReservations
                            resetId={resetId}
                            initialReservedItems={reservations}
                        />
                    </div>

                </div>
            </div>
            <RaidItemsList
                items={items}
                initialReservedItems={reservations}
                resetId={resetId}
            />
            <div className={'absolute -top-0 -right-24 z-10'}>
                <AdminPanel
                    isAdmin={!!data}
                    resetId={resetId}
                />
            </div>
        </div>
    )
}
