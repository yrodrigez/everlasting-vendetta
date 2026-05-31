"use client";

import { PageEvent } from "@/hooks/usePageEvent";
import { WarcraftLogsGateway } from "@/lib/warcraft-logs/warcraft-logs.gateway";
import { createRosterMemberRoute } from "@/util/create-roster-member-route";
import { GUILD_REALM_NAME, GUILD_REALM_SLUG } from "@/util/constants";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

export type LogsRosterMember = {
    id: number;
    name: string;
    level: number;
    avatar: string;
    realm: {
        name: string;
        slug: string;
    };
    playable_class: {
        name: string;
    };
};

type LogState =
    | { status: "loading" }
    | { status: "ranked"; bestPerformanceAverage: number }
    | { status: "unranked"; reason: string };

type LeaderboardEntry = {
    member: LogsRosterMember;
    logState: LogState;
    rank: number | null;
};

type RankedLeaderboardEntry = LeaderboardEntry & {
    logState: Extract<LogState, { status: "ranked" }>;
    rank: number;
};

const classColors: Record<string, string> = {
    warrior: "text-warrior",
    paladin: "text-paladin",
    hunter: "text-hunter",
    rogue: "text-rogue",
    priest: "text-priest",
    shaman: "text-shaman",
    mage: "text-mage",
    warlock: "text-warlock",
    druid: "text-druid",
};

const podiumStyles = {
    1: {
        border: "border-legendary",
        bg: "bg-legendary-900",
        text: "text-legendary",
        label: "Rank One",
    },
    2: {
        border: "border-epic",
        bg: "bg-epic-900",
        text: "text-epic",
        label: "Rank Two",
    },
    3: {
        border: "border-rare",
        bg: "bg-rare-900",
        text: "text-rare",
        label: "Rank Three",
    },
} as const;

const warcraftLogsGateway = new WarcraftLogsGateway((input, init) => fetch(input, init));
const LOG_FETCH_CONCURRENCY = 4;

export function LogsLeaderboard({ roster, canForceRefresh }: { roster: LogsRosterMember[]; canForceRefresh: boolean }) {
    const [logStates, setLogStates] = useState<Record<number, LogState>>({});
    const [isForceRefreshing, setIsForceRefreshing] = useState(false);
    const activeControllerRef = useRef<AbortController | null>(null);

    const fetchRosterLogs = async (force: boolean) => {
        activeControllerRef.current?.abort();

        const controller = new AbortController();
        activeControllerRef.current = controller;

        if (force) {
            setIsForceRefreshing(true);
        }


        setLogStates(Object.fromEntries(roster.map((member) => [member.id, { status: "loading" as const }])));

        let nextMemberIndex = 0;

        const fetchNextMember = async (): Promise<void> => {
            if (controller.signal.aborted) return;

            const member = roster[nextMemberIndex];
            nextMemberIndex += 1;

            if (!member) return;

            try {
                const logs = await warcraftLogsGateway.getCharacterLogs(GUILD_REALM_SLUG, member.name, {
                    force,
                    signal: controller.signal,
                });

                if (controller.signal.aborted) return;

                const bestPerformanceAverage = logs.character?.zoneRankings?.bestPerformanceAverage;

                setLogStates((current) => ({
                    ...current,
                    [member.id]: typeof bestPerformanceAverage === "number"
                        ? { status: "ranked", bestPerformanceAverage }
                        : { status: "unranked", reason: "No best performance average found" },
                }));
            } catch (error) {
                if (controller.signal.aborted) return;

                console.error(`Error fetching Warcraft Logs for ${member.name}:`, error);
                setLogStates((current) => ({
                    ...current,
                    [member.id]: { status: "unranked", reason: "Logs unavailable" },
                }));
            }

            await fetchNextMember();
        };

        await Promise.all(Array.from({ length: Math.min(LOG_FETCH_CONCURRENCY, roster.length) }, fetchNextMember));

        if (!controller.signal.aborted && activeControllerRef.current === controller) {
            setIsForceRefreshing(false);
        }
    };

    useEffect(() => {
        void fetchRosterLogs(false);

        return () => activeControllerRef.current?.abort();
    }, [roster]);

    const entries: LeaderboardEntry[] = useMemo(() => {
        const baseEntries: LeaderboardEntry[] = roster.map((member) => ({
            member,
            logState: logStates[member.id] ?? { status: "loading" as const },
            rank: null,
        }));

        const rankedEntries = baseEntries
            .filter((entry): entry is Omit<LeaderboardEntry, "logState"> & { logState: Extract<LogState, { status: "ranked" }> } => entry.logState.status === "ranked")
            .sort((a, b) => b.logState.bestPerformanceAverage - a.logState.bestPerformanceAverage)
            .map((entry, index) => ({ ...entry, rank: index + 1 }));

        const loadingEntries = baseEntries
            .filter((entry) => entry.logState.status === "loading")
            .sort((a, b) => a.member.name.localeCompare(b.member.name));

        const unrankedEntries = baseEntries
            .filter((entry) => entry.logState.status === "unranked")
            .sort((a, b) => a.member.name.localeCompare(b.member.name));

        return [...rankedEntries, ...loadingEntries, ...unrankedEntries];
    }, [logStates, roster]);

    const rankedEntries = entries.filter(isRankedEntry);
    const podium = rankedEntries.slice(0, 3);
    const highestAverage = podium[0]?.logState.status === "ranked" ? podium[0].logState.bestPerformanceAverage : null;
    const loadingCount = entries.filter((entry) => entry.logState.status === "loading").length;

    return (
        <main className="flex h-full w-full flex-col gap-4 overflow-auto px-2 py-3 text-default sm:px-4">
            <PageEvent name="logs_leaderboard_view" metadata={{ realm: GUILD_REALM_SLUG, metric: "bestPerformanceAverage" }} />
            {canForceRefresh ? (
                <button
                    type="button"
                    onClick={() => void fetchRosterLogs(true)}
                    disabled={isForceRefreshing}
                    className="fixed right-4 top-24 z-50 rounded-full border border-gold/50 bg-dark px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-gold shadow-2xl shadow-black/40 transition hover:border-gold hover:bg-wood disabled:cursor-wait disabled:opacity-70"
                >
                    {isForceRefreshing ? "Refreshing..." : "Refresh logs"}
                </button>
            ) : null}

            <section className="min-h-fit overflow-hidden rounded-2xl border border-gold/35 bg-wood shadow-xl shadow-black/30">
                <div className="relative p-5 sm:p-7">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,168,102,0.22),transparent_34%),linear-gradient(135deg,rgba(36,32,29,0.4),rgba(3,17,17,0.2))]" />
                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.28em] text-gold/80"></p>
                            <h1 className="mt-2 text-3xl font-black text-gold sm:text-5xl">Warcraft Logs Leaderboard</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-primary/70">
                                {GUILD_REALM_NAME} roster ranked by current Warcraft Logs <span className="font-bold text-primary">Best performance</span>.
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-3 lg:min-w-[420px]">
                            <HeroMetric label="Ranked" value={`${rankedEntries.length}/${roster.length}`} />
                            <HeroMetric label="Calculating" value={loadingCount} />
                            <HeroMetric label="Top Avg" value={highestAverage !== null ? formatPerformanceAverage(highestAverage) : "..."} />
                        </div>
                    </div>
                </div>
            </section>

            {podium.length ? (
                <section className="grid gap-3 lg:grid-cols-3">
                    {podium.map((entry) => (
                        <PodiumCard key={entry.member.id} entry={entry} />
                    ))}
                </section>
            ) : (
                <section className="grid gap-3 lg:grid-cols-3">
                    {[1, 2, 3].map((rank) => (
                        <PodiumPlaceholder key={rank} rank={rank} />
                    ))}
                </section>
            )}

            <section className="rounded-2xl border border-wood-100 bg-wood p-3 shadow-xl shadow-black/20">
                <div className="hidden grid-cols-[72px_minmax(0,1.7fr)_120px_160px] gap-3 border-b border-wood-100 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-default/45 lg:grid">
                    <span>Rank</span>
                    <span>Character</span>
                    <span>Class</span>
                    <span className="text-right">Best Avg</span>
                </div>
                <div className="divide-y divide-wood-100">
                    {entries.length ? entries.map((entry) => (
                        <LeaderboardRow key={entry.member.id} entry={entry} />
                    )) : (
                        <div className="px-3 py-10 text-center text-default/60">No eligible characters found for logs ranking.</div>
                    )}
                </div>
            </section>
        </main>
    );
}

function HeroMetric({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-xl border border-gold/20 bg-dark/70 p-3 shadow-lg shadow-black/20">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gold/60">{label}</p>
            <p className="mt-1 truncate text-lg font-black text-primary">{value}</p>
        </div>
    );
}

function PodiumCard({ entry }: { entry: RankedLeaderboardEntry }) {
    const style = getPodiumStyle(entry.rank);

    return (
        <Link
            href={createRosterMemberRoute(entry.member.name, entry.member.realm.slug)}
            className={`rounded-2xl border bg-wood shadow-xl shadow-black/25 transition hover:-translate-y-0.5 hover:shadow-2xl ${style.border}`}
        >
            <article className={`h-full rounded-xl border p-4 ${style.border} ${style.bg}`}>
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className={`text-xs font-black uppercase tracking-[0.22em] ${style.text}`}>#{entry.rank} {style.label}</p>
                        <h2 className="mt-1 truncate text-2xl font-black text-default">{entry.member.name}</h2>
                        <p className={getClassTextClass(entry.member.playable_class.name)}>{entry.member.playable_class.name}</p>
                    </div>
                    <CharacterAvatar member={entry.member} size="large" />
                </div>
                <div className="mt-5 rounded-xl border border-wood-100 bg-wood p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-default/45">Best performance average</p>
                    <p className={`mt-1 text-4xl font-black ${getRankPercentColor(entry.logState.bestPerformanceAverage)}`}>
                        {formatPerformanceAverage(entry.logState.bestPerformanceAverage)}
                    </p>
                </div>
            </article>
        </Link>
    );
}

function PodiumPlaceholder({ rank }: { rank: number }) {
    const style = getPodiumStyle(rank);

    return (
        <article className={`rounded-2xl border bg-wood shadow-xl shadow-black/25 ${style.border}`}>
            <div className={`h-full rounded-xl border p-4 ${style.border} ${style.bg}`}>
                <p className={`text-xs font-black uppercase tracking-[0.22em] ${style.text}`}>#{rank} Calculating</p>
                <div className="mt-4 h-7 w-36 animate-pulse rounded bg-wood-100/60" />
                <div className="mt-6 rounded-xl border border-wood-100 bg-wood p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-default/45">Best performance average</p>
                    <p className="mt-1 text-lg font-black text-default/45">calculating...</p>
                </div>
            </div>
        </article>
    );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
    const style = entry.rank ? getPodiumStyle(entry.rank) : null;

    return (
        <Link
            href={createRosterMemberRoute(entry.member.name, entry.member.realm.slug)}
            className={`grid gap-3 rounded-xl px-3 py-4 transition hover:bg-wood-900 lg:grid-cols-[72px_minmax(0,1.7fr)_120px_160px] lg:items-center ${entry.rank && entry.rank <= 3 && style ? style.bg : ""}`}
        >
            <div className={`text-2xl font-black ${entry.rank && entry.rank <= 3 && style ? style.text : "text-default"}`}>
                {entry.rank ? `#${entry.rank}` : "-"}
            </div>
            <div className="flex min-w-0 items-center gap-3">
                <CharacterAvatar member={entry.member} />
                <div className="min-w-0">
                    <p className="truncate font-black text-default">{entry.member.name}</p>
                    <p className="truncate text-xs text-default/45">Level {entry.member.level}</p>
                </div>
            </div>
            <RowMetric label="Class" value={entry.member.playable_class.name} valueClassName={getClassTextClass(entry.member.playable_class.name)} />
            <RowMetric label="Best Avg" value={getBestAverageLabel(entry.logState)} valueClassName={getBestAverageClass(entry.logState)} />
        </Link>
    );
}

function CharacterAvatar({ member, size = "normal" }: { member: LogsRosterMember; size?: "normal" | "large" }) {
    const className = size === "large" ? "h-16 w-16" : "h-11 w-11";

    if (member.avatar) {
        return (
            <img
                src={member.avatar}
                alt={`${member.name}'s portrait`}
                className={`${className} shrink-0 rounded-xl border border-wood-100 object-cover shadow-md shadow-black/30`}
            />
        );
    }

    return (
        <div className={`${className} flex shrink-0 items-center justify-center rounded-xl border border-wood-100 bg-moss text-lg font-black text-gold`}>
            {member.name.slice(0, 1).toUpperCase()}
        </div>
    );
}

function RowMetric({ label, value, valueClassName = "text-default" }: { label: string; value: string | number; valueClassName?: string }) {
    return (
        <div className="flex items-center justify-between gap-3 lg:block lg:text-right">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-default/45 lg:hidden">{label}</span>
            <span className={`font-black ${valueClassName}`}>{value}</span>
        </div>
    );
}

function isRankedEntry(entry: LeaderboardEntry): entry is RankedLeaderboardEntry {
    return entry.logState.status === "ranked" && typeof entry.rank === "number";
}

function getPodiumStyle(rank: number) {
    return podiumStyles[(rank <= 3 ? rank : 3) as keyof typeof podiumStyles];
}

function getClassTextClass(className: string) {
    return classColors[className.toLowerCase().replaceAll(" ", "")] ?? "text-default";
}

function getRankPercentColor(rankPercent: number) {
    if (rankPercent === 100) return "text-relic";
    if (rankPercent >= 95) return "text-pink";
    if (rankPercent >= 85) return "text-legendary";
    if (rankPercent >= 75) return "text-epic";
    if (rankPercent >= 45) return "text-rare";
    if (rankPercent > 20) return "text-uncommon";

    return "text-gray-500";
}

function getBestAverageLabel(logState: LogState) {
    if (logState.status === "loading") return "calculating...";
    if (logState.status === "unranked") return logState.reason;
    return formatPerformanceAverage(logState.bestPerformanceAverage);
}

function getBestAverageClass(logState: LogState) {
    if (logState.status === "loading") return "text-right text-sm text-gold/70";
    if (logState.status === "unranked") return "text-right text-sm text-default/45";
    return `${getRankPercentColor(logState.bestPerformanceAverage)} text-right text-xl`;
}

function formatPerformanceAverage(value: number) {
    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
    }).format(value);
}
