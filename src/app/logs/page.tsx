import { SomethingWentWrong } from "@/components/something-went-wrong";
import NotLoggedInView from "@/components/NotLoggedInView";
import { LogsLeaderboard, type LogsRosterMember } from "@/app/logs/components/logs-leaderboard";
import { createAPIService } from "@/lib/api";
import { GUILD_NAME, GUILD_REALM_NAME, GUILD_REALM_SLUG, ROLE } from "@/util/constants";
import createServerSession from "@/util/supabase/createServerSession";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: `${GUILD_NAME} Warcraft Logs Leaderboard - ${GUILD_REALM_NAME}`,
    description: `${GUILD_NAME} Warcraft Logs leaderboard for ${GUILD_REALM_NAME}, ranked by best performance average.`,
};

const findUniqueCharactersParticipatedInResets = async (supabase: SupabaseClient, realm: string) => {
    const relevantResetNames = ['Tempest Keep', 'Serpentshrine Cavern', 'Black Temple', 'Hyjal', 'Zul\'Aman', 'Sunwell Plateau'];
    const { data, error } = await supabase
        .from('ev_raid_participant')
        .select('member_id, reset:raid_resets!inner(realm, name)')
        .eq('is_confirmed', true)
        .eq('reset.realm', realm)
        .in('reset.name', relevantResetNames);

    if (error) {
        console.error("Error fetching unique characters participated in resets:", error);
        return [];
    }

    return [...new Set(data?.map((entry) => entry.member_id))];
}

async function getEligibleRoster(supabase: SupabaseClient): Promise<LogsRosterMember[]> {
    const apiService = createAPIService();
    const participatedInResets = await findUniqueCharactersParticipatedInResets(supabase, GUILD_REALM_SLUG);
    const roster = await apiService.anon.getGuildRoster() as LogsRosterMember[];

    return roster
        .filter((member) => member.realm?.slug === GUILD_REALM_SLUG && member.level >= 70 && participatedInResets.includes(member.id))
        .sort((a, b) => a.name.localeCompare(b.name));
}

export default async function LogsPage() {
    const { auth, getSupabase } = await createServerSession();
    const user = await auth.getSession();

    if (!user) {
        return (
            <NotLoggedInView />
        )
    }

    if (!user.isGuildMember) {
        return (
            <SomethingWentWrong
                header="Access denied"
                subheader="You do not have permission to view this page."
                body={<p className="text-primary/80">This page is only available to members of {GUILD_NAME}.</p>}
            />
        );
    }


    const supabase = await getSupabase();
    let roster: LogsRosterMember[];

    try {
        roster = await getEligibleRoster(supabase);
    } catch (error) {
        console.error("Error loading Warcraft Logs leaderboard:", error);

        return (
            <SomethingWentWrong
                header="Logs unavailable"
                subheader="The Warcraft Logs leaderboard could not be loaded right now."
                body={<p className="text-primary/80">Roster or log data failed to respond. Try refreshing in a moment.</p>}
            />
        );
    }

    return <LogsLeaderboard roster={roster} canForceRefresh={user.roles?.includes(ROLE.GUILD_MASTER) ?? false} />;
}
