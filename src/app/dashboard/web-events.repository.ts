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

async function withPagination<T>(
    buildQuery: (offset: number, limit: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
    pageSize = 1000
): Promise<T[]> {
    const result: T[] = [];
    let offset = 0;
    while (true) {
        const { data, error } = await buildQuery(offset, offset + pageSize - 1);
        if (error) { console.error("withPagination error:", error); break; }
        if (!data || data.length === 0) break;
        result.push(...data);
        if (data.length < pageSize) break;
        offset += pageSize;
    }
    return result;
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

        const [
            { count: eventsToday },
            { count: events7d },
            { count: events30d },
            { count: pageViews30d },
        ] = await Promise.all([
            this.supabase.from("web_events").select("*", { count: "exact", head: true }).gte("created_at", todayStart).neq("ip_address", "127.0.0.1"),
            this.supabase.from("web_events").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo).neq("ip_address", "127.0.0.1"),
            this.supabase.from("web_events").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo).neq("ip_address", "127.0.0.1"),
            this.supabase.from("web_events").select("*", { count: "exact", head: true }).eq("event_type", "page_view").gte("created_at", thirtyDaysAgo).neq("ip_address", "127.0.0.1"),
        ]);

        return {
            eventsToday: eventsToday ?? 0,
            events7d: events7d ?? 0,
            events30d: events30d ?? 0,
            pageViews30d: pageViews30d ?? 0,
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

        const [
            { count: bnetClientLogins },
            { count: discordClientLogins },
            { data: serverLoginEvents },
        ] = await Promise.all([
            this.supabase.from("web_events").select("*", { count: "exact", head: true }).eq("event_name", "login_bnet").gte("created_at", thirtyDaysAgo).neq("ip_address", "127.0.0.1"),
            this.supabase.from("web_events").select("*", { count: "exact", head: true }).eq("event_name", "login_discord").gte("created_at", thirtyDaysAgo).neq("ip_address", "127.0.0.1"),
            this.supabase.from("web_events").select("metadata").eq("event_name", "login_success").gte("created_at", thirtyDaysAgo).neq("ip_address", "127.0.0.1"),
        ]);

        let serverBnet = 0;
        let serverDiscord = 0;
        for (const event of serverLoginEvents ?? []) {
            const meta = event.metadata as Record<string, unknown> | null;
            if (meta?.provider === "battlenet") serverBnet++;
            else if (meta?.provider === "discord") serverDiscord++;
        }

        return {
            totalBnet: (bnetClientLogins ?? 0) + serverBnet,
            totalDiscord: (discordClientLogins ?? 0) + serverDiscord,
        };
    }

    public async getSessionActivity(): Promise<{ refreshTrend: { date: string; count: number }[]; revokeTrend: { date: string; count: number }[] }> {
        const thirtyDaysAgo = this.daysAgo(30).toISOString();

        // Token refresh/revoke are server-side events — don't filter by ip_address
        const allEvents = await withPagination<{ event_name: string; created_at: string }>(
            (offset, limit) => this.supabase
                .from("web_events")
                .select("event_name, created_at")
                .in("event_name", ["token_refresh", "token_revoke"])
                .gte("created_at", thirtyDaysAgo)
                .order("created_at", { ascending: true })
                .range(offset, limit)
        );

        const grouped = groupEventsByDayAndName(allEvents);
        return {
            refreshTrend: grouped["token_refresh"] ?? [],
            revokeTrend: grouped["token_revoke"] ?? [],
        };
    }

    public async getTopUsersWithProfiles(): Promise<TopUserProfile[]> {
        const thirtyDaysAgo = this.daysAgo(30).toISOString();

        const topUsersRaw = await withPagination<{ user_id: string }>(
            (offset, limit) => this.supabase
                .from("web_events")
                .select("user_id")
                .gte("created_at", thirtyDaysAgo)
                .not("user_id", "is", null)
                .neq("ip_address", "127.0.0.1")
                .range(offset, limit)
        );

        const validTopUsers = topUsersRaw.filter(
            (e): e is { user_id: string } => e.user_id !== null
        );
        const topUsersList = getTopUsers(validTopUsers, 10);
        const topUserIds = topUsersList.map((u) => u.userId);

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

        return topUsersList.map((u) => {
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

        const ipData = await withPagination<{ ip_address: string }>(
            (offset, limit) => this.supabase
                .from("web_events")
                .select("ip_address")
                .neq("ip_address", null)
                .neq("ip_address", "127.0.0.1")
                .neq("user_agent", "node")
                .neq("event_name", "token_refresh")
                .neq("event_name", "login_bnet")
                .neq("event_name", "login_discord")
                .neq("event_name", "login_success")
                .neq("event_name", "token_revoke")
                .neq("event_name", "discord_invite_clicked")
                .neq("event_name", "account_created")
                .gte("created_at", thirtyDaysAgo)
                .range(offset, limit)
        );

        const distinctIps = [...new Set(ipData.map((e) => e.ip_address).filter(Boolean))];
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

        const lootHistory = await withPagination<Record<string, unknown>>(
            (offset, limit) => this.supabase
                .from("ev_loot_history")
                .select("character, raid_id, raid_resets(raid_id, raid_date, ev_raid(name, image)), offspec")
                .neq("character", "_disenchanted")
                .in("character", memberNames)
                .range(offset, limit)
        );

        const lootByRaid: Record<string, { raidName: string; raidImage: string | null; latestDate: string; characters: Record<string, { ms: number; os: number }> }> = {};

        for (const entry of lootHistory) {
            const r = entry;
            const resetRaw = Array.isArray(r.raid_resets) ? r.raid_resets[0] : r.raid_resets;
            const reset = resetRaw as Record<string, unknown> | null;
            const raidRaw = Array.isArray(reset?.ev_raid) ? (reset.ev_raid as unknown[])[0] : reset?.ev_raid;
            const raid = raidRaw as Record<string, unknown> | null;
            const raidName = raid?.name as string | undefined;
            const raidImage = (raid?.image as string) ?? null;
            const raidId = reset?.raid_id as string | undefined;
            const raidDate = (reset?.raid_date as string) ?? "";
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

function getTopUsers(events: { user_id: string }[], limit: number): { userId: string; count: number }[] {
    const counts: Record<string, number> = {};
    for (const event of events) {
        counts[event.user_id] = (counts[event.user_id] || 0) + 1;
    }
    return Object.entries(counts)
        .map(([userId, count]) => ({ userId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

function groupEventsByDayAndName(
    events: { created_at: string; event_name: string }[]
): Record<string, { date: string; count: number }[]> {
    const grouped: Record<string, Record<string, number>> = {};
    for (const event of events) {
        const date = event.created_at.split("T")[0];
        if (!grouped[event.event_name]) grouped[event.event_name] = {};
        grouped[event.event_name][date] = (grouped[event.event_name][date] || 0) + 1;
    }
    const result: Record<string, { date: string; count: number }[]> = {};
    for (const [name, dates] of Object.entries(grouped)) {
        result[name] = Object.entries(dates)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
    return result;
}
