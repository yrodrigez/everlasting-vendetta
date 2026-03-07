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

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const { auth, getSupabase } = await createServerSession();
    const session = await auth.getSession();

    if (!session || !session.id || !session.roles?.includes(ROLE.ADMIN)) {
        return (
            <div className="w-full h-full flex items-center justify-center text-4xl text-red-500 font-bold flex-col gap-4">
                <span className="text-9xl">🚫</span>
                <span>Unauthorized</span>
            </div>
        );
    }

    const supabase = await getSupabase();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

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
        .not('user_id', 'is', null);

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
        .order('created_at', { ascending: false })
        .limit(50);

    // User geo distribution (exclude auth events — their IPs come from the OAuth host, not the user)
    const { data: ipData } = await supabase
        .from('web_events')
        .select('ip_address')
        .not('ip_address', 'is', null)
        .not('event_name', 'in', '("login_bnet","login_discord","login_success","token_refresh","token_revoke")');

    const distinctIps = [...new Set((ipData ?? []).map(e => e.ip_address as string).filter(Boolean))];
    const geoData = aggregateUsersByCountry(distinctIps);

    return (
        <div className="flex flex-col gap-6 p-4 w-full">
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

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

            <Card className="bg-dark border border-dark-100 p-4">
                <CardHeader>
                    <h2 className="text-xl font-bold text-gray-400">Session Activity (30d)</h2>
                </CardHeader>
                <CardBody>
                    <SessionActivityChart refreshData={refreshTrend} revokeData={revokeTrend} />
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
