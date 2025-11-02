import moment from "moment-timezone";

import { RaidResetCard } from "@/app/calendar/components/RaidResetCard";
import { cookies } from "next/headers";

import { Metadata } from "next";
import { Button } from "@/app/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { type SupabaseClient } from "@supabase/supabase-js";
import createServerSession from "@/app/util/supabase/createServerSession";
import { fetchResetParticipants } from "@/app/raid/api/fetchParticipants";
import Refresher from "@/app/calendar/components/Refresher";
import CreateNewCard from "@/app/calendar/components/CreateNewCard";
import CalendarPagination from "@/app/calendar/components/CalendarPagination";

export const dynamic = 'force-dynamic'

const MAX_RAID_RESETS = 9

async function fetchMaxRaidResets(supabase: SupabaseClient, page = 0) {
    const { count } = await supabase
        .from('raid_resets')
        .select('*', { count: 'exact', head: true });

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / MAX_RAID_RESETS);

    const currentPage = page === 0 ? totalPages : page;
    const offset = Math.max(0, (totalItems - ((currentPage) * MAX_RAID_RESETS)));

    const raidResets = await supabase.from('raid_resets')
        .select('raid_date, id, raid:ev_raid(name, min_level, image), time, end_date, modifiedBy:ev_member!modified_by(character), modified_at, end_time, status')
        .order('raid_date', { ascending: false })
        .order('raid_id', { ascending: false })
        .range(offset, (offset + MAX_RAID_RESETS - 1))
        .limit(MAX_RAID_RESETS)
        .overrideTypes<{
            raid_date: string;
            id: string;
            raid: { name: string, min_level: number, image: string };
            time: string;
            end_date: string;
            modifiedBy: { character: { name: string } }
            modified_at: string
            end_time: string
            status?: 'online' | 'offline'
        }[], { merge: false }>();

    if (raidResets.error) {
        console.error('Error fetching raid resets: ' + JSON.stringify(raidResets))
        return {
            raidResets: [],
            totalPages: 0,
            currentPage: 0
        }
    }

    return {
        raidResets: (raidResets.data ?? []).sort((a: any, b: any) => {
            return moment(a.raid_date).diff(moment(b.raid_date))
        }),
        totalPages,
        currentPage
    }
}

export async function generateMetadata(): Promise<Metadata> {
    const metadataBase = new URL(process.env.NEXT_PUBLIC_BASE_URL!);

    return {
        title: 'Upcoming Raids | Everlasting Vendetta',
        description:
            'Check out the upcoming raids organized by Everlasting Vendetta. Join us for epic battles and adventures in World of Warcraft!',
        keywords:
            'wow, world of warcraft, raids, upcoming raids, raiding, pve, guild events, Everlasting Vendetta',
        openGraph: {
            title: 'Upcoming Raids | Everlasting Vendetta',
            description:
                'Join Everlasting Vendetta in our upcoming raids. Prepare for epic encounters and secure your place in the battle!',
            images: [
                {
                    url: new URL('/banner.webp', metadataBase).toString(),
                    width: 800,
                    height: 600,
                    alt: 'Everlasting Vendetta Raid',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Upcoming Raids | Everlasting Vendetta',
            description:
                'Get ready for the upcoming raids organized by Everlasting Vendetta. Don’t miss out on the action!',
            images: new URL('/banner.webp', metadataBase).toString(),
        },
    };
}

const normalizePage = (page: number | undefined): number => {
    if (typeof page !== 'number' || isNaN(page) || page < 0) {
        return 0;
    }

    return Math.floor(page);
}

export default async function Page({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
    const { getSupabase, auth } = await createServerSession();
    const supabase = await getSupabase();
    const user = await auth.getSession()
    const { p: page = '0' } = await searchParams
    const { raidResets, totalPages, currentPage } = await fetchMaxRaidResets(supabase, normalizePage(parseInt(page)))
    const raidResetsWithParticipants = await Promise.all(raidResets.map(async (raidReset: any) => {
        const raidRegistrations = await fetchResetParticipants(supabase, raidReset.id)

        return {
            ...raidReset,
            raidRegistrations,
            registrationStatus: raidRegistrations.find(r => r.member.id === user?.selectedCharacter?.id)?.details?.status
        }
    }))

    const canCreate = user?.permissions?.some(p => p === 'reset.create')

    return (
        <main className="flex flex-col justify-between items-center relative h-full w-full gap-2">
            <div className="flex gap-3 flex-col md:flex-wrap md:flex-row px-8 md:px-0 h-full overflow-auto scrollbar-pill justify-start items-center">
                {raidResetsWithParticipants.map((raidReset: any, index: number) => {
                    return <RaidResetCard
                        raidEndDate={raidReset.end_date}
                        isEditable={user?.permissions?.some(p => p === 'reset.edit') && moment(raidReset.raid_date + 'T' + raidReset.time).isAfter(moment())}
                        id={raidReset.id}
                        key={index}
                        raidName={raidReset.raid.name}
                        raidImage={`/${raidReset.raid.image}`}
                        raidDate={raidReset.raid_date}
                        raidTime={raidReset.time}
                        raidRegistrations={raidReset.raidRegistrations}
                        modifiedBy={raidReset.modifiedBy?.character?.name}
                        lastModified={raidReset.modified_at}
                        endTime={raidReset.end_time}
                        registrationStatus={raidReset.registrationStatus}
                        status={raidReset.status}
                    />
                })}
                {raidResets.length < 9 && (<CreateNewCard />)}
            </div>
            <CalendarPagination
                currentPage={currentPage}
                totalPages={totalPages}
            />
            <div className={
                `absolute top-0 lg:-right-8 -right-1 h-full`
            }>
                <div className="sticky top-0 flex flex-col gap-2">
                    {canCreate &&
                        <Button href={'/calendar/new'} as="a" isIconOnly>
                            <FontAwesomeIcon icon={faAdd} />
                        </Button>}
                </div>
            </div>
            <Refresher />
        </main>
    )
}
