import moment from "moment-timezone";

import { RaidResetCard } from "@/app/calendar/components/RaidResetCard";

import CalendarPagination from "@/app/calendar/components/CalendarPagination";
import CreateNewCard from "@/app/calendar/components/CreateNewCard";
import Refresher from "@/app/calendar/components/Refresher";
import { Button } from "@/components/Button";
import { PageEvent } from '@/hooks/usePageEvent';
import createServerSession from '@/util/supabase/createServerSession';
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ScrollShadow } from "@/components/scroll-shadow";
import { MemberRolesRepository } from "../raid/api/member-roles.repository";
import { ParticipantsService } from "../raid/api/participants.service";
import { CalendarService } from "./calendar.service";
import RaidResetsRepository from "./raid-resets.repository";

export const dynamic = 'force-dynamic'
export { generateMetadata } from "@/app/calendar/generate-metadata";

export default async function Page({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
    const { getSupabase, auth } = await createServerSession();
    const supabase = await getSupabase();
    const user = await auth.getSession();
    const { p: page = '0' } = await searchParams
    const raidResetRepository = new RaidResetsRepository(supabase)
    const calendarService = new CalendarService(raidResetRepository)
    const { raidResets, totalPages, currentPage } = await calendarService.fetchCalendarPage(page)

    const memberRolesRepository = new MemberRolesRepository(supabase)
    const participantsService = new ParticipantsService(supabase, memberRolesRepository);
    const raidResetsWithParticipants = await Promise.all(raidResets.map(async (raidReset: any) => {
        const raidRegistrations = await participantsService.fetchParticipantsWithRoles(raidReset.id)

        return {
            ...raidReset,
            raidRegistrations,
            registrationStatus: raidRegistrations.find(r => r.member.id === user?.selectedCharacter?.id)?.details?.status
        }
    }))

    const isAdmin = user?.roles?.some(p => p === 'ADMIN') || false
    const canCreate = user?.permissions?.some(p => p === 'reset.create') || isAdmin
    const canEdit = user?.permissions?.some(p => p === 'reset.edit') || isAdmin
    const shouldShowCreate = canCreate && raidResets.length < calendarService.MAX_RAID_RESETS && currentPage === totalPages

    return (
        <main className="flex flex-col justify-center items-center relative h-full w-full gap-2">
            <PageEvent name="calendar" />
            <ScrollShadow className="flex gap-3 flex-col p-8 overflow-auto scrollbar-pill mb-auto md:grid lg:grid-cols-3 md:grid-cols-2 rounded-xl">
                {raidResetsWithParticipants.sort((a, b) => {
                    return moment(a.raid_date).diff(moment(b.raid_date));
                }).map((raidReset: any, index: number) => {
                    const isResetEditable = canEdit && moment(raidReset.raid_date + 'T' + raidReset.time).isAfter(moment())
                    return <RaidResetCard
                        raidEndDate={raidReset.end_date}
                        isEditable={isResetEditable}
                        id={raidReset.id}
                        key={index}
                        raidName={raidReset.raid.name}
                        raidImage={`/${raidReset.raid.image}`}
                        raidDate={raidReset.raid_date}
                        raidTime={raidReset.time}
                        raidRegistrations={raidReset.raidRegistrations}
                        modifiedBy={raidReset.modifiedBy?.character?.name}
                        createdBy={raidReset.createdBy?.character?.name}
                        createdByCharacter={raidReset.createdBy?.character}
                        lastModified={raidReset.modified_at}
                        endTime={raidReset.end_time}
                        registrationStatus={raidReset.registrationStatus}
                        status={raidReset.status}
                        size={raidReset.raid.size}
                        composition={raidReset.composition}
                    />
                })}
                {shouldShowCreate && (<CreateNewCard />)}
            </ScrollShadow>
            <CalendarPagination
                currentPage={currentPage}
                totalPages={totalPages}
            />
            <div className="absolute top-0 md:-right-2 right-2 h-full">
                <div className="sticky top-2 flex flex-col gap-2">
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
