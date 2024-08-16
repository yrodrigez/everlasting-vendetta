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
import NotLoggedInView from "@/app/components/NotLoggedInView";
type Raid = {
    min_level: number;
    name: string;
    image: string;
    reservation_amount: number;
};

type RaidQueryResult = {
    raid_id: string;
    raid: Raid;  // Specifying that `raid` is a single object of type `Raid`
    raid_date: string;
    time: string;
    end_date: string;
};


export default async function Page({params}: { params: { id: string } }) {
    const token = cookies().get(process.env.BNET_COOKIE_NAME!)?.value
    const evToken = cookies().get(process.env.EV_COOKIE_NAME!)?.value
    if (!token || !evToken) {
        return <NotLoggedInView/>
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
    const resetData = await database
        .from('raid_resets')
        .select('raid_id, raid:ev_raid(min_level, name, image, reservation_amount), raid_date, time, end_date')
        .eq('id', resetId)
        .single<RaidQueryResult>()

    if (!resetData.data) {
        return <div>Reset not found</div>
    }


    const loggedInCharacter = getLoggedInUserFromAccessToken(evToken)
    const raid  = resetData.data.raid
    const raidMinLevel = raid?.min_level
    if (raidMinLevel > loggedInCharacter.level) {
        return <div className="mt-auto mb-auto w-full p-8 bg-dark border border-gold rounded-lg">
            <h1 className="text-center text-2xl mb-2">
                Character level too low you should be <span className="text-gold font-bold">{raidMinLevel}</span> but
                you are {loggedInCharacter.level}</h1>
            <h2>We encourage you to engage in other activities to level up your character which
                is only <span className="text-gold font-bold">{raidMinLevel - loggedInCharacter.level}</span> levels
                away from the required level.
            </h2>
            <h4 className="text-xs text-gray-500 mt-2">If you think this is an error please try disconnecting from the game and login
                in a incognito window.
            </h4>
        </div>
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
                className={'absolute -top-0 -left-72 w-64 h-48 z-10 border-gold border rounded-md'}>
                <div className="relative flex w-full h-full">
                    <div className="absolute flex p-2 rounded-md background-position-center bg-cover w-full h-full"
                         style={{
                             backgroundImage: `url('/${resetData.data?.raid?.image}')`,
                             backgroundSize: 'cover',
                             backgroundPosition: 'center',
                             filter: 'brightness(35%)'
                         }}/>
                    <div className="flex flex-col w-full h-full justify-between relative p-2">
                        <div className="flex items-center gap-2">
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
            <div className={`absolute -top-0 -right-24 z-10`}>
                <AdminPanel
                    isAdmin={!!data}
                    resetId={resetId}
                />
            </div>
        </div>
    )
}
