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
const EXPIRATION_HOURS = 8
const DEFAULT_RAID_TIME = '20:30'

function isRaidExpired(raid_date: string, time?: string | null): boolean {
    return moment(`${raid_date}T${time || DEFAULT_RAID_TIME}`)
        .add(EXPIRATION_HOURS, 'hours')
        .isBefore(moment())
}

const RAID_RESET_SELECT = 'raid_date, id, raid:ev_raid(name, min_level, image), time, end_date, modifiedBy:ev_member!modified_by(character), modified_at, end_time, status'

type RaidResetRow = {
    raid_date: string
    id: string
    raid: { name: string; min_level: number; image: string }
    time: string
    end_date: string
    modifiedBy: { character: { name: string } }
    modified_at: string
    end_time: string
    status?: 'online' | 'offline'
}

async function fetchCalendarPage(supabase: SupabaseClient, page: number) {
    // Safe cutoff: any raid_date before this is DEFINITELY expired (even with time 23:59 + 8h)
    const safeCutoff = moment().subtract(2, 'days').format('YYYY-MM-DD')

    // Parallel: fetch recent/future raids + count old expired
    const [recentResult, oldExpiredCountResult] = await Promise.all([
        supabase
            .from('raid_resets')
            .select(RAID_RESET_SELECT)
            .gte('raid_date', safeCutoff)
            .order('raid_date', { ascending: true })
            .order('raid_id', { ascending: true })
            .overrideTypes<RaidResetRow[], { merge: false }>(),
        supabase
            .from('raid_resets')
            .select('*', { count: 'exact', head: true })
            .lt('raid_date', safeCutoff),
    ])

    if (recentResult.error) {
        console.error('Error fetching recent raids: ' + JSON.stringify(recentResult.error))
        return { raidResets: [], totalPages: 1, currentPage: 1 }
    }

    const recentRaids = recentResult.data || []
    const activeRaids = recentRaids.filter(r => !isRaidExpired(r.raid_date, r.time))
    const recentlyExpired = recentRaids.filter(r => isRaidExpired(r.raid_date, r.time))
    const oldExpiredCount = oldExpiredCountResult.count || 0
    const totalExpired = oldExpiredCount + recentlyExpired.length
    const totalPastPages = totalExpired > 0 ? Math.ceil(totalExpired / MAX_RAID_RESETS) : 0
    const totalPages = Math.max(1, totalPastPages + 1) // last page is always the active page
    const currentPage = page === 0 ? totalPages : Math.min(Math.max(1, page), totalPages)

    // === Active page (last page) ===
    if (currentPage === totalPages) {
        return {
            raidResets: activeRaids.sort((a, b) => moment(a.raid_date).diff(moment(b.raid_date))),
            totalPages,
            currentPage,
        }
    }

    // === Past page: paginate expired raids ===
    // Virtual list ASC (oldest=0, newest=totalExpired-1): [oldExpired..., recentlyExpired...]
    // Last past page (totalPastPages, closest to active) is always full (9).
    // Page 1 (oldest) may have fewer items (the remainder).
    const ascEnd = totalExpired - (totalPastPages - currentPage) * MAX_RAID_RESETS - 1
    const ascStart = Math.max(0, ascEnd - MAX_RAID_RESETS + 1)

    let pageRaids: RaidResetRow[] = []

    if (ascEnd < oldExpiredCount) {
        // Entire page from DB (all definitely old expired)
        // DB is ordered DESC: DESC index i = ASC index (oldExpiredCount - 1 - i)
        const dbRangeStart = oldExpiredCount - 1 - ascEnd
        const dbRangeEnd = oldExpiredCount - 1 - ascStart
        const { data, error } = await supabase
            .from('raid_resets')
            .select(RAID_RESET_SELECT)
            .lt('raid_date', safeCutoff)
            .order('raid_date', { ascending: false })
            .order('raid_id', { ascending: false })
            .range(dbRangeStart, dbRangeEnd)
            .overrideTypes<RaidResetRow[], { merge: false }>()

        if (error) {
            console.error('Error fetching past raids: ' + JSON.stringify(error))
            return { raidResets: [], totalPages, currentPage }
        }
        pageRaids = (data || []).sort((a, b) => moment(a.raid_date).diff(moment(b.raid_date)))
    } else if (ascStart >= oldExpiredCount) {
        // Entire page from recentlyExpired (in memory, already ASC)
        const memStart = ascStart - oldExpiredCount
        const memEnd = ascEnd - oldExpiredCount
        pageRaids = recentlyExpired.slice(memStart, memEnd + 1)
    } else {
        // Boundary: tail of old expired from DB + head of recentlyExpired from memory
        // DB part: ASC indices [ascStart, oldExpiredCount - 1]
        const dbRangeStart = 0 // most recent of the old expired (DESC index 0)
        const dbRangeEnd = oldExpiredCount - 1 - ascStart
        const { data, error } = await supabase
            .from('raid_resets')
            .select(RAID_RESET_SELECT)
            .lt('raid_date', safeCutoff)
            .order('raid_date', { ascending: false })
            .order('raid_id', { ascending: false })
            .range(dbRangeStart, dbRangeEnd)
            .overrideTypes<RaidResetRow[], { merge: false }>()

        if (error) {
            console.error('Error fetching past raids: ' + JSON.stringify(error))
            return { raidResets: [], totalPages, currentPage }
        }
        const fromDb = (data || []).sort((a, b) => moment(a.raid_date).diff(moment(b.raid_date)))
        // Memory part: ASC indices [oldExpiredCount, ascEnd]
        const memEnd = ascEnd - oldExpiredCount
        const fromMem = recentlyExpired.slice(0, memEnd + 1)
        pageRaids = [...fromDb, ...fromMem]
    }

    return {
        raidResets: pageRaids,
        totalPages,
        currentPage,
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
    const { raidResets, totalPages, currentPage } = await fetchCalendarPage(supabase, normalizePage(parseInt(page)))
    const raidResetsWithParticipants = await Promise.all(raidResets.map(async (raidReset: any) => {
        const raidRegistrations = await fetchResetParticipants(supabase, raidReset.id)

        return {
            ...raidReset,
            raidRegistrations,
            registrationStatus: raidRegistrations.find(r => r.member.id === user?.selectedCharacter?.id)?.details?.status
        }
    }))

    const canCreate = user?.permissions?.some(p => p === 'reset.create')
    const shouldShowCreate = canCreate && raidResets.length < MAX_RAID_RESETS && currentPage === totalPages

    return (
        <main className="flex flex-col justify-between items-center relative h-full w-full gap-2">
            <div className="flex gap-3 flex-col md:flex-wrap md:flex-row px-8 md:px-4 h-full overflow-auto scrollbar-pill justify-start items-start self-start">
                {raidResetsWithParticipants.sort((a, b) => {
                    return moment(a.raid_date).diff(moment(b.raid_date));
                }).map((raidReset: any, index: number) => {
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
                {shouldShowCreate && (<CreateNewCard />)}
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
