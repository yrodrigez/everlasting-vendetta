import { Button } from "@/app/components/Button";
import NotLoggedInView from "@/app/components/NotLoggedInView";
import { SomethingWentWrong } from "@/app/components/something-went-wrong";
import AdminPanel from "@/app/raid/[id]/soft-reserv/AdminPanel";
import { BannedItems, ImportBannedItems } from "@/app/raid/[id]/soft-reserv/BannedItems";
import RaidItemsList from "@/app/raid/[id]/soft-reserv/RaidItemsList";
import YourReservations from "@/app/raid/[id]/soft-reserv/YourReservations";
import RaidTimeInfo from "@/app/raid/components/RaidTimeInfo";
import createServerSession from "@utils/supabase/createServerSession";
import moment from "moment";
import { Metadata } from "next";
import { RaidItemsProvider } from "./raid-items-context";
import { ReservationsRepository } from "./reservations-repository";
import { log } from "node:console";

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
    reservations_closed: boolean;
    end_time: string;
    created_by: number;
    realm: string;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { getSupabase } = await createServerSession();
    // Fetch the raid reset data
    const { id: raidId } = await params
    const supabase = await getSupabase();
    const resetData = await supabase
        .from('raid_resets')
        .select('raid:ev_raid(name, image), raid_date, time, end_date, end_time')
        .eq('id', raidId)
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


    const { raid, raid_date: raidDate, time: raidTime, end_date: raidEndDate } = resetData.data;
    const { name: raidName } = raid;

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

export default async function Page({ params }: { params: Promise<{ id: string }> }) {

    const { getSupabase, auth } = await createServerSession();
    const database = await getSupabase();
    const loggedInUser = await auth.getSession()
    if (!loggedInUser) {
        return <NotLoggedInView />
    }


    const { id: raidId } = await params

    const {
        data: resetIdData,
        error: resetIdError
    } = await database.rpc('reset_id_starts_with', { id_prefix: `${raidId}%` })

    if (resetIdError) {
        return <div>Reset not found</div>
    }

    const resetId = resetIdData[0]?.id

    const resetData = await database
        .from('raid_resets')
        .select('raid_id, realm, raid:ev_raid(min_level, name, image, reservation_amount, id), raid_date, time, end_date, end_time, created_by, reservations_closed')
        .eq('id', resetId)
        .single<RaidQueryResult>()

    if (!resetData.data) {
        return <div>Reset not found</div>
    }

    if (!loggedInUser.selectedCharacter) {
        return <SomethingWentWrong
            header="No Character Selected"
            body={
                <>
                    <p>
                        You do not have a character selected. Please select a character to view raid reservations.
                    </p>
                    <p
                        className="mt-3 text-xs text-primary/55"
                    >
                        If you believe this is an error, please contact support or try again later.
                    </p>
                </>
            }
            footer={<>
                <div>
                    <Button
                        as="a"
                        className="w-full"
                        href={`/raid/${raidId}`}>
                        Go Back To Raid
                    </Button>
                </div>
            </>
            }
        />
    }

    if (loggedInUser.selectedCharacter?.realmSlug !== resetData.data.realm) {
        return <SomethingWentWrong
            header="Realm Mismatch"
            body={
                <>
                    <p>
                        Your selected character's realm <b>{loggedInUser.selectedCharacter?.realmSlug.split('-').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' ')}</b> does not match the raid's realm <b>{resetData.data.realm.split('-').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' ')}</b>.
                    </p>
                    <p>
                        Please switch to a character on the correct realm to access the raid reservations.
                    </p>
                    <p
                        className="mt-3 text-xs text-primary/55"
                    >
                        If you believe this is an error, please contact support or try again later.
                    </p>
                </>
            }
            footer={<>
                <div>
                    <Button
                        as="a"
                        className="w-full"
                        href={`/raid/${raidId}`}>
                        Go Back To Raid
                    </Button>
                </div>
            </>
            }
        />
    }

    const loggedInCharacter = loggedInUser.selectedCharacter
    const raid = resetData.data.raid
    const raidMinLevel = raid?.min_level
    if (Number(raidMinLevel) > Number(loggedInCharacter?.level ?? 0)) {
        return <SomethingWentWrong
            header="Character Level Too Low"
            body={
                <>
                    <p>
                        Your character <b>{loggedInCharacter?.name}</b> is level <b>{loggedInCharacter?.level}</b>, which is below the required level of <b>{raidMinLevel}</b> to participate in this raid.
                    </p>
                    <p>
                        We encourage you to engage in other activities to level up your character which is only <b>{raidMinLevel - (loggedInCharacter?.level ?? 0)}</b> levels away from the required level.
                    </p>
                    <p
                        className="mt-3 text-xs text-primary/55"
                    >
                        If you think this is an error please try disconnecting from the game and login in an incognito window.
                    </p>
                </>
            }
        />
    }

    const repository = new ReservationsRepository(database);
    const raidIdStr = resetData.data.raid_id;
    const [items, reservations, hardReservations] = await Promise.all([
        repository.getRaidItems(resetId, raidIdStr),
        repository.fetchReservedItems(resetId),
        repository.getHardReservations(resetId)
    ]);
    const isAdmin = loggedInUser.isAdmin

    return (
        <div
            className="w-full flex-col flex h-full justify-between relative items-center p-2 gap-2 scrollbar-pill lg:overflow-visible flex-1">
            <RaidItemsProvider raidId={raidIdStr} initialReservations={reservations} resetId={raidId} initialItems={items} isOpen={!resetData.data.reservations_closed}>
                <div
                    className={'lg:hidden lg:top-0 lg:-left-72 w-64 h-48 z-50 border-gold border rounded-md inline-flex '}>
                    <div className="relative flex w-full h-full">
                        <div className="absolute flex p-2 rounded-md background-position-center bg-cover w-full h-full"
                            style={{
                                backgroundImage: `url("/${resetData.data?.raid?.image}")`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                filter: 'brightness(35%)'
                            }} />
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
                                baseReservationAmount={resetData?.data?.raid?.reservation_amount}
                                resetId={resetId}
                                initialReservedItems={reservations}
                            />
                        </div>
                    </div>
                </div>
                <RaidItemsList
                    initialReservedItems={reservations}
                    resetId={resetId}
                    isAdmin={isAdmin}
                />
                <div
                    className={`self-start lg:self-auto lg:w-fit w-full overflow-visible inline-flex lg:absolute lg:top-0 lg:-right-24 z-50`}>
                    <AdminPanel
                        isAdmin={isAdmin}
                        realmSlug={resetData.data.realm}
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
                            }} />
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
                                baseReservationAmount={resetData?.data?.raid?.reservation_amount}
                                resetId={resetId}
                                initialReservedItems={reservations}
                            />
                        </div>
                        <div className="flex flex-col gap-2 mt-6">
                            <span className="text-lg font-bold">Banned items</span>
                            {!!hardReservations?.length ? (<BannedItems
                                realmSlug={resetData.data.realm}
                                hardReservations={hardReservations}
                                reset_id={resetId}
                                isAdmin={isAdmin}
                                raid_id={resetData.data.raid_id}
                            />) : (
                                <div className="flex flex-col gap-2 justify-center items-center relative">
                                    <span className={'text-gray-500 text-sm'}>No items are banned for this raid</span>
                                    {isAdmin && (
                                        <ImportBannedItems
                                            raid_id={resetData.data.raid_id}
                                            reset_id={resetId}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </RaidItemsProvider>
        </div>
    )
}
