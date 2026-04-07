import { SupabaseClient } from "@supabase/supabase-js";
import moment from "moment-timezone";

const TZ = "Europe/Madrid";

export interface OverviewCounts {
    eventsToday: number;
    events7d: number;
    events30d: number;
    pageViews30d: number;
}

export interface TrendUser {
    created_at: string;
    user_id: string;
}

export interface LoginBreakdown {
    totalBnet: number;
    totalDiscord: number;
}

export interface TopUserProfile {
    userId: string;
    name: string;
    avatar: string;
    eventCount: number;
}

export interface LootByRaid {
    raidId: string;
    raidName: string;
    raidImage: string | null;
    latestDate: string;
    top: { character: string; count: { ms: number; os: number } }[];
}


export class WebEventsRepository {
    constructor(private supabase: SupabaseClient) { }

    private todayStart() {
        return moment.tz(TZ).startOf("day");
    }

    private daysAgo(days: number) {
        return moment.tz(TZ).startOf("day").subtract(days, "days");
    }

    public async getOverviewCounts(): Promise<OverviewCounts> {
        const todayStart = this.todayStart().toISOString();
        const sevenDaysAgo = this.daysAgo(7).toISOString();
        const thirtyDaysAgo = this.daysAgo(30).toISOString();

        const { data } = await this.supabase.rpc("get_overview_counts", {
            today_start: todayStart,
            seven_days_ago: sevenDaysAgo,
            thirty_days_ago: thirtyDaysAgo,
        }).single<{ events_today: number; events_7d: number; events_30d: number; page_views_30d: number }>();


        return {
            eventsToday: Number(data?.events_today ?? 0),
            events7d: Number(data?.events_7d ?? 0),
            events30d: Number(data?.events_30d ?? 0),
            pageViews30d: Number(data?.page_views_30d ?? 0),
        };
    }

    public async getActiveUserStats(): Promise<{ dau: number; wau: number; mau: number }> {
        const { data } = await this.supabase.rpc("get_active_user_stats").single<{ dau: number; wau: number; mau: number }>();

        return {
            dau: Number(data?.dau ?? 0),
            wau: Number(data?.wau ?? 0),
            mau: Number(data?.mau ?? 0),
        };
    }

    public async getRaidSchedule(daysBack = 30): Promise<Record<string, string[]>> {
        const startDate = this.daysAgo(daysBack).format("YYYY-MM-DD");

        const { data } = await this.supabase
            .from("raid_resets")
            .select("raid_date, raid:ev_raid(name)")
            .gte("raid_date", startDate)
            .order("raid_date", { ascending: true });

        const schedule: Record<string, string[]> = {};
        for (const row of data ?? []) {
            const date = row.raid_date as string;
            const raidRaw = Array.isArray(row.raid) ? row.raid[0] : row.raid;
            const name = (raidRaw as { name?: string })?.name;
            if (!date || !name) continue;
            if (!schedule[date]) schedule[date] = [];
            if (!schedule[date].includes(name)) schedule[date].push(name);
        }
        return JSON.parse(JSON.stringify(schedule));
    }

    public async getDailyActiveUsers(daysBack = 30): Promise<{ date: string; count: number }[]> {
        const { data } = await this.supabase.rpc("get_daily_active_users", { days_back: daysBack });

        const mapped = (data ?? []).map((row: { date: string; count: number }) => ({
            date: String(row.date),
            count: Number(row.count),
        }));

        return mapped;
    }

    public async getLoginBreakdown(): Promise<LoginBreakdown> {
        const thirtyDaysAgo = this.daysAgo(30).toISOString();

        const { data } = await this.supabase.rpc("get_login_breakdown", { since: thirtyDaysAgo }).single<{
            bnet_client: number; discord_client: number; bnet_server: number; discord_server: number;
        }>();

        return {
            totalBnet: Number(data?.bnet_client ?? 0) + Number(data?.bnet_server ?? 0),
            totalDiscord: Number(data?.discord_client ?? 0) + Number(data?.discord_server ?? 0),
        };
    }

    public async getSessionActivity(): Promise<{ refreshTrend: { date: string; count: number }[]; revokeTrend: { date: string; count: number }[] }> {
        const thirtyDaysAgo = this.daysAgo(30).toISOString();

        const { data } = await this.supabase.rpc("get_session_activity", { since: thirtyDaysAgo });

        const refreshTrend: { date: string; count: number }[] = [];
        const revokeTrend: { date: string; count: number }[] = [];
        for (const row of data ?? []) {
            const entry = { date: String(row.date), count: Number(row.count) };
            if (row.event_name === "token_refresh") refreshTrend.push(entry);
            else if (row.event_name === "token_revoke") revokeTrend.push(entry);
        }

        return { refreshTrend, revokeTrend };
    }

    public async getTopUsersWithProfiles(): Promise<TopUserProfile[]> {
        const thirtyDaysAgo = this.daysAgo(30).toISOString();

        const { data: topUsersRaw } = await this.supabase.rpc("get_top_users_by_event_count", {
            since: thirtyDaysAgo,
            result_limit: 10,
        });

        const topUsersList = (topUsersRaw ?? []).map((u: { user_id: string; event_count: number }) => ({
            userId: u.user_id,
            count: Number(u.event_count),
        }));
        const topUserIds = topUsersList.map((u: { userId: string; count: number }) => u.userId);

        if (topUserIds.length === 0) return [];

        const { data: profiles } = await this.supabase
            .from("ev_member")
            .select("user_id, character")
            .in("user_id", topUserIds)
            .eq("is_selected", true);

        const profileMap = new Map<string, { name: string; avatar: string; fullName?: string; realmSlug?: string }>();
        for (const p of profiles ?? []) {
            if (p.user_id && !profileMap.has(p.user_id)) {
                const char = p.character as { name?: string; avatar?: string; realm?: { slug?: string } } | null;
                profileMap.set(p.user_id, {
                    name: char?.name ?? p.user_id.slice(0, 8),
                    avatar: char?.avatar ?? "/avatar-anon.png",
                    fullName: char?.name,
                    realmSlug: char?.realm?.slug,
                });
            }
        }

        return topUsersList.map((u: { userId: string; count: number }) => {
            const profile = profileMap.get(u.userId);
            return {
                userId: u.userId,
                name: profile?.name ?? u.userId.slice(0, 8),
                fullName: profile?.fullName,
                realmSlug: profile?.realmSlug,
                avatar: profile?.avatar ?? "/avatar-anon.png",
                eventCount: u.count,
            };
        });
    }

    public async getRecentEvents() {
        const { data } = await this.supabase
            .from("web_events")
            .select("event_name, event_type, user_id, created_at, page_path")
            .neq("event_name", "token_refresh")
            .neq("ip_address", "127.0.0.1")
            .order("created_at", { ascending: false })
            .limit(50);

        return data ?? [];
    }

    public async getGeoDistribution(): Promise<{ country: string; countryName: string; count: number }[]> {
        const thirtyDaysAgo = this.daysAgo(30).toISOString();

        const { data } = await this.supabase.rpc("get_distinct_ips", { since: thirtyDaysAgo });

        const distinctIps = (data ?? []).map((r: { ip_address: string }) => r.ip_address).filter(Boolean);
        return aggregateUsersByCountry(distinctIps);
    }

    public async getGuildMembers() {
        const [{ data: members }, { data: banned }] = await Promise.all([
            this.supabase
                .from("ev_member")
                .select("id, character, is_selected")
                .eq("character->guild->>name", "Everlasting Vendetta"),
            this.supabase
                .from("banned_member")
                .select("member_id"),
        ]);

        const bannedIds = new Set((banned ?? []).map((b) => b.member_id));
        return (members ?? []).filter((m) => !bannedIds.has(m.id));
    }

    public async getTopLootByRaid(guildMembers: { character: unknown; is_selected: boolean }[]): Promise<LootByRaid[]> {
        const memberNames = guildMembers
            .map((m) => (m.character as { name?: string }).name)
            .filter((n): n is string => !!n);

        if (memberNames.length === 0) return [];

        const { data } = await this.supabase.rpc("get_top_loot_by_raid", { member_names: memberNames });

        const lootByRaid: Record<string, { raidName: string; raidImage: string | null; latestDate: string; characters: Record<string, { ms: number; os: number }> }> = {};

        for (const row of data ?? []) {
            const raidId = row.raid_id as string;
            const raidName = row.raid_name as string;
            const raidImage = (row.raid_image as string) ?? null;
            const raidDate = (row.latest_date as string) ?? "";
            const character = row.character as string;
            if (!raidName || !raidId || !character) continue;
            if (!lootByRaid[raidId]) lootByRaid[raidId] = { raidName, raidImage, latestDate: raidDate, characters: {} };
            if (raidDate > lootByRaid[raidId].latestDate) lootByRaid[raidId].latestDate = raidDate;
            lootByRaid[raidId].characters[character] = {
                ms: Number(row.ms_count),
                os: Number(row.os_count),
            };
        }

        return Object.entries(lootByRaid)
            .map(([raidId, { raidName, raidImage, latestDate, characters }]) => ({
                raidId,
                raidName,
                raidImage,
                latestDate,
                top: Object.entries(characters)
                    .map(([character, count]) => ({ character, count }))
                    .sort((a, b) => b.count.ms - a.count.ms)
                    .slice(0, 5),
            }))
            .sort((a, b) => b.latestDate.localeCompare(a.latestDate));
    }

    public getClassDistribution(guildMembers: { character: { level: number; character_class?: { name?: string }; guild?: { name?: string } }; is_selected: boolean }[]): Record<string, number> {
        const classDistribution: Record<string, number> = {};
        for (const m of guildMembers) {
            if (!m.is_selected) continue;
            if (!m.character) continue;
            const char = m.character as { character_class?: { name?: string }; guild?: { name?: string } } | null;
            if (char?.guild?.name !== "Everlasting Vendetta") continue;
            if (m.character?.level < 70) continue;
            const className = char?.character_class?.name;
            if (className) {
                classDistribution[className] = (classDistribution[className] || 0) + 1;
            }
        }
        return classDistribution;
    }
}

// --- Utility functions (moved from utils.ts, kept here as they're repo-adjacent) ---

import geoip from "geoip-lite";

function aggregateUsersByCountry(ipAddresses: string[]): { country: string; countryName: string; count: number }[] {
    const countryCounts: Record<string, number> = {};
    const countryNames: Record<string, string> = {};

    for (const ip of ipAddresses) {
        const geo = geoip.lookup(ip);
        if (geo && geo.country) {
            countryCounts[geo.country] = (countryCounts[geo.country] || 0) + 1;
            if (!countryNames[geo.country]) {
                countryNames[geo.country] = getCountryName(geo.country);
            }
        }
    }

    return Object.entries(countryCounts)
        .map(([country, count]) => ({ country, countryName: countryNames[country], count }))
        .sort((a, b) => b.count - a.count);
}

function getCountryName(code: string): string {
    try {
        const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
        return displayNames.of(code) ?? code;
    } catch {
        return code;
    }
}

