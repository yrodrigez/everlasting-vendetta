import {cookies} from "next/headers";
import RaidItemsList from "@/app/raid/[id]/soft-reserv/RaidItemsList";
import {raidLootReservationsColumns} from "@/app/raid/[id]/soft-reserv/supabase_config";
import {RaidItem, Reservation} from "@/app/raid/[id]/soft-reserv/types";
import {getLoggedInUserFromAccessToken} from "@/app/util";
import YourReservations from "@/app/raid/[id]/soft-reserv/YourReservations";
import React from "react";
import AdminPanel from "@/app/raid/[id]/soft-reserv/AdminPanel";
import RaidTimeInfo from "@/app/raid/components/RaidTimeInfo";
import NotLoggedInView from "@/app/components/NotLoggedInView";
import {Metadata} from "next";
import moment from "moment";
import {BannedItems} from "@/app/raid/[id]/soft-reserv/BannedItems";
import createServerSession from "@utils/supabase/createServerSession";

type Raid = {
    min_level: number;
    name: string;
    image: string;
    reservation_amount: number;
    id: string;
};

type RaidQueryResult = {
    raid_id: string;
    raid: Raid;  // Specifying that `raid` is a single object of type `Raid`
    raid_date: string;
    time: string;
    end_date: string;
    end_time: string;
    created_by: number;
};

export async function generateMetadata({params}: { params: { id: string } }): Promise<Metadata> {
    const {supabase} = createServerSession({cookies})
    // Fetch the raid reset data
    const resetData = await supabase
        .from('raid_resets')
        .select('raid:ev_raid(name, image), raid_date, time, end_date, end_time')
        .eq('id', params.id)
        .single<{
            raid: Raid;
            raid_date: string;
            time: string;
            end_date: string;
            end_time: string;
        }>();

    if (!resetData.data) {
        return {
            title: 'Raid Not Found | Everlasting Vendetta',
            description: 'The raid you are looking for does not exist or cannot be found.',
        };
    }


    const {raid, raid_date: raidDate, time: raidTime, end_date: raidEndDate} = resetData.data;
    const {name: raidName} = raid;

    const raidStartDateFormatted = moment(raidDate).format('MMMM D, YYYY');
    const raidEndDateFormatted = moment(raidEndDate).format('MMMM D, YYYY');

    const metadataBase = new URL(process.env.NEXT_PUBLIC_BASE_URL!);

    return {
        title: `${raidName} - Raid on ${raidStartDateFormatted} | Everlasting Vendetta`,
        description: `Join the ${raidName} raid starting on ${raidStartDateFormatted} at ${raidTime}. Participate in epic battles and secure your loot until ${raidEndDateFormatted}.`,
        keywords: 'wow, world of warcraft, raid, raiding, pve, guild, loot, soft reservations, Everlasting Vendetta',
        openGraph: {
            title: `${raidName} - Raid on ${raidStartDateFormatted}`,
            description: `Don't miss the ${raidName} raid from ${raidStartDateFormatted} to ${raidEndDateFormatted}. Be part of the adventure and claim your loot.`,
            images: [
                {
                    url: new URL(raid.image, metadataBase).toString(),
                    width: 800,
                    height: 600,
                    alt: `${raidName} Raid Image`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${raidName} - Raid on ${raidStartDateFormatted}`,
            description: `Join the ${raidName} raid from ${raidStartDateFormatted} to ${raidEndDateFormatted}. Prepare for epic battles and claim your rewards.`,
            images: new URL(raid.image, metadataBase).toString(),
        },
        metadataBase,  // Set the metadata base URL
    };
}

export default async function Page({params}: { params: { id: string } }) {
    const token = cookies().get(process.env.BNET_COOKIE_NAME!)?.value
    const evToken = cookies().get(process.env.EV_COOKIE_NAME!)?.value
    if (!token || !evToken) {
        return <NotLoggedInView/>
    }

    const {supabase: database} = createServerSession({cookies})


    const {
        data: resetIdData,
        error: resetIdError
    } = await database.rpc('reset_id_starts_with', {id_prefix: `${params.id}%`})

    if (resetIdError) {
        return <div>Reset not found</div>
    }

    const resetId = resetIdData[0]?.id

    const resetData = await database
        .from('raid_resets')
        .select('raid_id, raid:ev_raid(min_level, name, image, reservation_amount, id), raid_date, time, end_date, end_time, created_by')
        .eq('id', resetId)
        .single<RaidQueryResult>()

    if (!resetData.data) {
        return <div>Reset not found</div>
    }


    const loggedInCharacter = getLoggedInUserFromAccessToken(evToken)
    const raid = resetData.data.raid
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
            <h4 className="text-xs text-gray-500 mt-2">If you think this is an error please try disconnecting from the
                game and login
                in a incognito window.
            </h4>
        </div>
    }

    const [hardReservations, databaseItems] = await Promise.all([
        database.from('reset_hard_reserve')
            .select('item_id, item:raid_loot_item(*)')
            .eq('reset_id', resetId)
            .returns<{ item_id: number, item: any }[]>(),
        database.from('raid_loot')
            .select('item:raid_loot_item(*)')
            .eq('raid_id', resetData.data?.raid_id)
            .eq('is_visible', true)
            .returns<{ item: RaidItem }[]>()
    ])

    const items = (databaseItems.data ?? []).map(function (x) {
        return {
            ...x.item,
            isHardReserved: !!hardReservations?.data?.some(r => r.item_id === x.item.id)
        }
    }).reduce(function (acc, item) {
        if (!acc.find(i => i.id === item.id)) {
            acc.push(item)
        }
        return acc
    }, [] as RaidItem[])

    const dataBaseReservations = await database.from('raid_loot_reservation')
        .select(raidLootReservationsColumns)
        .eq('reset_id', resetId)


    const reservations = (dataBaseReservations?.data ?? []) as unknown as Reservation[]
    let isAdmin = resetData?.data?.created_by === loggedInCharacter?.id
    if (!isAdmin) {
        let {data} = await database.from('ev_admin').select('id').eq('id', loggedInCharacter.id).single()
        if (data) {
            isAdmin = true
        }
    }

    return (
        <div
            className="w-full flex-col flex h-full justify-between relative items-center p-2 gap-2 scrollbar-pill lg:overflow-visible flex-1">
            <div
                className={'lg:hidden lg:top-0 lg:-left-72 w-64 h-48 z-50 border-gold border rounded-md inline-flex '}>
                <div className="relative flex w-full h-full">
                    <div className="absolute flex p-2 rounded-md background-position-center bg-cover w-full h-full"
                         style={{
                             backgroundImage: `url("/${resetData.data?.raid?.image}")`,
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
                                raidEndTime={resetData.data.end_time}
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
                isAdmin={isAdmin}
            />
            <div
                className={`self-start lg:self-auto lg:w-fit w-full overflow-visible inline-flex lg:absolute lg:top-0 lg:-right-24 z-50`}>
                <AdminPanel
                    isAdmin={isAdmin}
                    resetId={resetId}
                />
            </div>
            <div
                className={'lg:inline-flex hidden lg:absolute lg:top-0 lg:-left-72 w-64 h-48 z-50 border-gold border rounded-md'}>
                <div className="relative flex w-full h-full flex-col gap-4">
                    <div className="absolute flex p-2 rounded-md background-position-center bg-cover w-full h-full"
                         style={{
                             backgroundImage: `url("/${resetData.data?.raid?.image}")`,
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
                                raidEndTime={resetData.data.end_time}
                            />
                        </div>
                        <YourReservations
                            resetId={resetId}
                            initialReservedItems={reservations}
                        />
                    </div>
                    <div>
                        {!!hardReservations?.data?.length && (
                            <div className="flex flex-col gap-2">
                                <span className="text-lg font-bold">Banned items</span>
                                <BannedItems
                                    hardReservations={hardReservations.data}
                                    reset_id={resetId}
                                    isAdmin={isAdmin}
                                    raid_id={resetData.data.raid_id}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
