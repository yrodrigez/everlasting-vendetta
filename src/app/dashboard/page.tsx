import createServerSession from "@utils/supabase/createServerSession";
import { ROLE } from "@utils/constants";
import { Card, CardBody, CardHeader } from "@/app/components/card";
import { aggregateUsersByCountry, countUniqueUsersByDay, getTopUsers, groupEventsByDayAndName } from "./utils";
import OverviewCards from "./components/OverviewCards";
import ActiveUsersChart from "./components/ActiveUsersChart";
import LoginBreakdownChart from "./components/LoginBreakdownChart";
import SessionActivityChart from "./components/SessionActivityChart";
import TopUsersTable from "./components/TopUsersTable";
import RecentEventsFeed from "./components/RecentEventsFeed";
import UserWorldMap from "./components/UserWorldMap";
import ClassDistributionChart from "./components/ClassDistributionChart";
import TopLootByRaid from "./components/TopLootByRaid";
import { SomethingWentWrong } from "../components/something-went-wrong";
import NotLoggedInView from "../components/NotLoggedInView";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const { auth, getSupabase } = await createServerSession();
    const session = await auth.getSession();

    if (!session?.id) {
        return (
            <NotLoggedInView />
        )

    }

    if (!session.roles?.includes(ROLE.ADMIN)) {
        return (
            <SomethingWentWrong
                header='Access Denied'
                body={(
                    <p className="text-center">
                        You do not have permission to view this page.
                    </p>
                )}
                footer={(
                    <p className="text-center">
                        Please log in with an account that has access.
                    </p>
                )}
            />
        );
    }

    const supabase = await getSupabase();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const sevenDaysAgo = new Date(new Date(todayStart).getTime() - 7 * 86400000).toISOString();
    const thirtyDaysAgo = new Date(new Date(todayStart).getTime() - 30 * 86400000).toISOString();

    // Overview counts
    const [
        { count: eventsToday },
        { count: events7d },
        { count: events30d },
        { count: pageViews30d },
    ] = await Promise.all([
        supabase.from('web_events').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
        supabase.from('web_events').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
        supabase.from('web_events').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
        supabase.from('web_events').select('*', { count: 'exact', head: true }).eq('event_type', 'page_view').gte('created_at', thirtyDaysAgo),
    ]);

    // Active users trend (30d)
    const { data: trendData } = await supabase
        .from('web_events')
        .select('created_at, user_id')
        .gte('created_at', thirtyDaysAgo)
        .not('user_id', 'is', null);

    const validTrendData = (trendData ?? []).filter((e): e is { created_at: string; user_id: string } => e.user_id !== null);
    const dailyActiveUsers = countUniqueUsersByDay(validTrendData);
    const uniqueUsers30d = new Set(validTrendData.map(e => e.user_id)).size;

    // DAU / WAU
    const todayUsers = validTrendData.filter(e => e.created_at >= todayStart);
    const weekUsers = validTrendData.filter(e => e.created_at >= sevenDaysAgo);
    const dau = new Set(todayUsers.map(e => e.user_id)).size;
    const wau = new Set(weekUsers.map(e => e.user_id)).size;

    // Login breakdown (combine client-side + server-side events)
    const [
        { count: bnetClientLogins },
        { count: discordClientLogins },
        { data: serverLoginEvents },
    ] = await Promise.all([
        supabase.from('web_events').select('*', { count: 'exact', head: true }).eq('event_name', 'login_bnet').gte('created_at', thirtyDaysAgo),
        supabase.from('web_events').select('*', { count: 'exact', head: true }).eq('event_name', 'login_discord').gte('created_at', thirtyDaysAgo),
        supabase.from('web_events').select('metadata').eq('event_name', 'login_success').gte('created_at', thirtyDaysAgo),
    ]);

    let serverBnet = 0;
    let serverDiscord = 0;
    for (const event of serverLoginEvents ?? []) {
        const meta = event.metadata as Record<string, unknown> | null;
        if (meta?.provider === 'battlenet') serverBnet++;
        else if (meta?.provider === 'discord') serverDiscord++;
    }
    const totalBnet = (bnetClientLogins ?? 0) + serverBnet;
    const totalDiscord = (discordClientLogins ?? 0) + serverDiscord;

    // Session activity (token_refresh + token_revoke)
    const { data: sessionEvents } = await supabase
        .from('web_events')
        .select('event_name, created_at')
        .in('event_name', ['token_refresh', 'token_revoke'])
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: true });

    const sessionByDay = groupEventsByDayAndName(sessionEvents ?? []);
    const refreshTrend = sessionByDay['token_refresh'] ?? [];
    const revokeTrend = sessionByDay['token_revoke'] ?? [];

    // Top users
    const { data: topUsersRaw } = await supabase
        .from('web_events')
        .select('user_id')
        .gte('created_at', thirtyDaysAgo)
        .not('user_id', 'is', null)
        .not('event_name', 'eq', 'token_refresh');

    const validTopUsers = (topUsersRaw ?? []).filter((e): e is { user_id: string } => e.user_id !== null);
    const topUsersList = getTopUsers(validTopUsers, 10);
    const topUserIds = topUsersList.map(u => u.userId);

    let topUsersWithProfiles: { userId: string; name: string; avatar: string; eventCount: number }[] = [];
    if (topUserIds.length > 0) {
        const { data: profiles } = await supabase
            .from('ev_member')
            .select('user_id, character')
            .in('user_id', topUserIds)
            .eq('is_selected', true);

        const profileMap = new Map<string, { name: string; avatar: string }>();
        for (const p of profiles ?? []) {
            if (p.user_id && !profileMap.has(p.user_id)) {
                const char = p.character as { name?: string; avatar?: string } | null;
                profileMap.set(p.user_id, {
                    name: char?.name ?? p.user_id.slice(0, 8),
                    avatar: char?.avatar ?? '/avatar-anon.png',
                });
            }
        }

        topUsersWithProfiles = topUsersList.map(u => {
            const profile = profileMap.get(u.userId);
            return {
                userId: u.userId,
                name: profile?.name ?? u.userId.slice(0, 8),
                avatar: profile?.avatar ?? '/avatar-anon.png',
                eventCount: u.count,
            };
        });
    }

    // Recent events
    const { data: recentEvents } = await supabase
        .from('web_events')
        .select('event_name, event_type, user_id, created_at, page_path')
        .neq('event_name', 'token_refresh')
        .order('created_at', { ascending: false })
        .limit(50);

    // User geo distribution (exclude auth events — their IPs come from the OAuth host, not the user)
    const { data: ipData } = await supabase
        .from('web_events')
        .select('ip_address')
        .not('ip_address', 'is', null)
        .neq('event_name', 'token_refresh')
        .neq('event_name', 'login_bnet')
        .neq('event_name', 'login_discord')
        .neq('event_name', 'login_success')
        .neq('event_name', 'token_revoke')
        .neq('event_name', 'discord_invite_clicked')
        .neq('event_name', 'account_created')
        .gte('created_at', thirtyDaysAgo);
        //.not('event_name', 'in', '("login_bnet","login_discord","login_success","token_refresh","token_revoke", "discord_invite_clicked")');

    const distinctIps = [...new Set((ipData ?? []).map(e => e.ip_address as string).filter(Boolean))];
    const geoData = aggregateUsersByCountry(distinctIps);


    // Class distribution (guild members only)
    const { data: guildMembers } = await supabase
        .from('ev_member')
        .select('character, is_selected')
        .eq('character->guild->>name', 'Everlasting Vendetta');

    const classDistribution: Record<string, number> = {};
    for (const m of guildMembers ?? []) {
        if (!m.is_selected) continue;
        const char = m.character as { character_class?: { name?: string }; guild?: { name?: string } } | null;
        if (char?.guild?.name !== 'Everlasting Vendetta') continue;
        const className = char?.character_class?.name;
        if (className) {
            classDistribution[className] = (classDistribution[className] || 0) + 1;
        }
    }

    // Top loot receivers per raid (grouped by raid, sorted by most recent reset date)
    const lootHistory: Record<string, unknown>[] = [];
    let lootOffset = 0;
    const LOOT_PAGE_SIZE = 1000;
    while (true) {
        const { data: page } = await supabase
            .from('ev_loot_history')
            .select('character, raid_id, raid_resets(raid_id, raid_date, ev_raid(name, image)), offspec')
            .neq('character', '_disenchanted')
            .in('character', guildMembers?.map(m => (m.character as { name?: string }).name).filter((n): n is string => !!n) ?? [])
            .range(lootOffset, lootOffset + LOOT_PAGE_SIZE - 1);
        if (!page || page.length === 0) break;
        lootHistory.push(...(page as Record<string, unknown>[]));
        if (page.length < LOOT_PAGE_SIZE) break;
        lootOffset += LOOT_PAGE_SIZE;
    }

    const lootByRaid: Record<string, { raidName: string; raidImage: string | null; latestDate: string; characters: Record<string, { ms: number, os: number }> }> = {};
    for (const entry of lootHistory) {
        const r = entry;
        const resetRaw = Array.isArray(r.raid_resets) ? r.raid_resets[0] : r.raid_resets;
        const reset = resetRaw as Record<string, unknown> | null;
        const raidRaw = Array.isArray(reset?.ev_raid) ? (reset.ev_raid as unknown[])[0] : reset?.ev_raid;
        const raid = raidRaw as Record<string, unknown> | null;
        const raidName = raid?.name as string | undefined;
        const raidImage = (raid?.image as string) ?? null;
        const raidId = reset?.raid_id as string | undefined;
        const raidDate = (reset?.raid_date as string) ?? '';
        const character = r.character as string | undefined;
        if (!raidName || !raidId || !character) continue;
        if (!lootByRaid[raidId]) lootByRaid[raidId] = { raidName, raidImage, latestDate: raidDate, characters: {} };
        if (raidDate > lootByRaid[raidId].latestDate) lootByRaid[raidId].latestDate = raidDate;
        const offspec = r.offspec as boolean | undefined;
        if (!lootByRaid[raidId].characters[character]) lootByRaid[raidId].characters[character] = { ms: 0, os: 0 };
        if (offspec) {
            lootByRaid[raidId].characters[character].os += 1;
        } else {
            lootByRaid[raidId].characters[character].ms += 1;
        }
    }

    const topLootByRaid = Object.entries(lootByRaid).map(([raidId, { raidName, raidImage, latestDate, characters }]) => ({
        raidId,
        raidName,
        raidImage,
        latestDate,
        top: Object.entries(characters)
            .map(([character, count]) => ({ character, count }))
            .sort((a, b) => b.count.ms - a.count.ms)
            .slice(0, 5),
    })).sort((a, b) => b.latestDate.localeCompare(a.latestDate));

    return (
        <div className="flex flex-col gap-6 p-4 w-full">
            <h1 className="text-3xl font-bold">Guild Dashboard</h1>

            <OverviewCards
                eventsToday={eventsToday ?? 0}
                events7d={events7d ?? 0}
                events30d={events30d ?? 0}
                uniqueUsers={uniqueUsers30d}
                pageViews={pageViews30d ?? 0}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-dark border border-dark-100 p-4">
                    <CardHeader>
                        <h2 className="text-xl font-bold text-default">Active Users (30d)</h2>
                    </CardHeader>
                    <CardBody>
                        <div className="flex gap-6 mb-4 text-sm">
                            <div>
                                <span className="text-gray-400">DAU</span>
                                <p className="text-xl font-bold text-default">{dau}</p>
                            </div>
                            <div>
                                <span className="text-gray-400">WAU</span>
                                <p className="text-xl font-bold text-default">{wau}</p>
                            </div>
                            <div>
                                <span className="text-gray-400">MAU</span>
                                <p className="text-xl font-bold text-default">{uniqueUsers30d}</p>
                            </div>
                        </div>
                        <ActiveUsersChart data={dailyActiveUsers} />
                    </CardBody>
                </Card>
                <Card className="bg-dark border border-dark-100 p-4">
                    <CardHeader>
                        <h2 className="text-xl font-bold text-gray-400">Login Methods (30d)</h2>
                    </CardHeader>
                    <CardBody>
                        <LoginBreakdownChart bnet={totalBnet} discord={totalDiscord} />
                    </CardBody>
                </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-dark border border-dark-100 p-4">
                    <CardHeader>
                        <h2 className="text-xl font-bold text-gray-400">Class Distribution (Guild only)</h2>
                    </CardHeader>
                    <CardBody>
                        <ClassDistributionChart data={classDistribution} />
                    </CardBody>
                </Card>

                <Card className="bg-dark border border-dark-100 p-4">
                    <CardHeader>
                        <h2 className="text-xl font-bold text-gray-400">Session Activity (30d)</h2>
                    </CardHeader>
                    <CardBody>
                        <SessionActivityChart refreshData={refreshTrend} revokeData={revokeTrend} />
                    </CardBody>
                </Card>
            </div>

            <Card className="bg-dark border border-dark-100 p-4">
                <CardHeader>
                    <h2 className="text-xl font-bold text-gray-400">Top Loot Receivers (by Raid)</h2>
                </CardHeader>
                <CardBody>
                    <TopLootByRaid raids={topLootByRaid} />
                </CardBody>
            </Card>

            <Card className="bg-dark border border-dark-100 p-4">
                <CardHeader>
                    <h2 className="text-xl font-bold text-gray-400">User Locations</h2>
                </CardHeader>
                <CardBody>
                    <UserWorldMap data={geoData} />
                </CardBody>
            </Card>



            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-dark border border-dark-100 p-4">
                    <CardHeader>
                        <h2 className="text-xl font-bold text-gray-400 ">Top Active Users</h2>
                    </CardHeader>
                    <CardBody>
                        <TopUsersTable users={topUsersWithProfiles} />
                    </CardBody>
                </Card>

                <Card className="bg-dark border border-dark-100 p-4">
                    <CardHeader>
                        <h2 className="text-xl font-bold text-gray-400">Recent Events</h2>
                    </CardHeader>
                    <CardBody>
                        <RecentEventsFeed events={recentEvents ?? []} />
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
