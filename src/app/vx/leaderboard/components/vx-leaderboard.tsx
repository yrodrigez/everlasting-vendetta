"use client";

import { Button } from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { createAPIService, type EvxLeaderboardEntry } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

const apiService = createAPIService();

const podiumStyles = {
    1: {
        border: "border-legendary",
        bg: "bg-legendary-900",
        text: "text-legendary",
        label: "Legendary",
    },
    2: {
        border: "border-epic",
        bg: "bg-epic-900",
        text: "text-epic",
        label: "Epic",
    },
    3: {
        border: "border-rare",
        bg: "bg-rare-900",
        text: "text-rare",
        label: "Rare",
    },
} as const;

export default function VxLeaderboard({ headingClassName }: { headingClassName: string }) {
    const { authReady, accessToken } = useAuth();
    const leaderboardQuery = useQuery({
        queryKey: ["evx", "leaderboard"],
        queryFn: () => apiService.evx.getLeaderboard(),
        enabled: authReady && !!accessToken,
    });

    const entries = (leaderboardQuery.data ?? []).slice(0, 25);
    const podium = entries.slice(0, 3);

    return (
        <main className="flex h-full w-full flex-col gap-4 overflow-auto px-2 py-3 text-default sm:px-4">
            <section className="rounded-2xl border border-wood-100 bg-wood p-4 shadow-xl shadow-black/30">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.28em] text-gold/80">Vendetta Exchange</p>
                        <h1 className={`${headingClassName} mt-1 text-2xl font-bold text-gold sm:text-3xl`}>Leaderboard</h1>
                        <p className="mt-1 text-sm text-default/60">Top 25 guild members ranked by the VX ledger.</p>
                    </div>
                    <Button as={Link} href="/vx" className="w-fit border-moss-100 bg-moss text-gold hover:bg-moss-100">
                        Back to markets
                    </Button>
                </div>
            </section>

            {leaderboardQuery.isLoading || !authReady ? (
                <section className="rounded-2xl border border-wood-100 bg-wood p-10 text-center text-default/60">Loading leaderboard...</section>
            ) : leaderboardQuery.error ? (
                <section className="rounded-2xl border border-red-500/30 bg-red-950/30 p-4 text-center text-red-200">The leaderboard could not be loaded.</section>
            ) : entries.length ? (
                <>
                    <section className="grid gap-3 lg:grid-cols-3">
                        {podium.map((entry) => (
                            <PodiumCard key={entry.walletId} entry={entry} />
                        ))}
                    </section>
                    <section className="rounded-2xl border border-wood-100 bg-wood p-3 shadow-xl shadow-black/20">
                        <div className="hidden grid-cols-[72px_minmax(0,1.5fr)_repeat(6,minmax(90px,1fr))] gap-3 border-b border-wood-100 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-default/45 lg:grid">
                            <span>Rank</span>
                            <span>Character</span>
                            <span>Balance</span>
                            <span>Net</span>
                            <span>Pledged</span>
                            <span>Active</span>
                            <span>Record</span>
                            <span>Bets</span>
                        </div>
                        <div className="divide-y divide-wood-100">
                            {entries.map((entry) => (
                                <LeaderboardRow key={entry.walletId} entry={entry} />
                            ))}
                        </div>
                    </section>
                </>
            ) : (
                <section className="rounded-2xl border border-dashed border-wood-100 bg-wood p-10 text-center text-default/60">No leaderboard entries yet.</section>
            )}
        </main>
    );
}

function PodiumCard({ entry }: { entry: EvxLeaderboardEntry }) {
    const style = getPodiumStyle(entry.rank);

    return (
        <article className={`rounded-2xl border bg-wood shadow-xl shadow-black/25 ${style.border}`}>
            <div className={`rounded-xl border p-4 ${style.border} ${style.bg}`}>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className={`text-xs font-black uppercase tracking-[0.22em] ${style.text}`}>#{entry.rank} {style.label}</p>
                        <h2 className="mt-1 text-2xl font-black text-default">{getCharacterName(entry)}</h2>
                    </div>
                    <Avatar entry={entry} size="large" />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
                    <Metric label="Balance" value={formatEvx(entry.balance)} />
                    <Metric label="Net" value={formatSignedEvx(entry.netProfit)} valueClassName={getProfitClass(entry.netProfit)} />
                    <Metric label="Won" value={entry.marketsWon} valueClassName="text-emerald-300" />
                    <Metric label="Lost" value={entry.marketsLost} valueClassName="text-red-300" />
                </div>
            </div>
        </article>
    );
}

function LeaderboardRow({ entry }: { entry: EvxLeaderboardEntry }) {
    const style = getPodiumStyle(entry.rank);

    return (
        <article className={`grid gap-3 px-3 py-4 lg:grid-cols-[72px_minmax(0,1.5fr)_repeat(6,minmax(90px,1fr))] lg:items-center ${entry.rank <= 3 ? `${style.bg}` : ""}`}>
            <div className={`text-2xl font-black ${entry.rank <= 3 ? style.text : "text-default"}`}>#{entry.rank}</div>
            <div className="flex min-w-0 items-center gap-3">
                <Avatar entry={entry} />
                <div className="min-w-0">
                    <p className="truncate font-black text-default">{getCharacterName(entry)}</p>
                    <p className="truncate text-xs text-default/45">{entry.userId}</p>
                </div>
            </div>
            <RowMetric label="Balance" value={formatEvx(entry.balance)} />
            <RowMetric label="Net" value={formatSignedEvx(entry.netProfit)} valueClassName={getProfitClass(entry.netProfit)} />
            <RowMetric label="Pledged" value={formatEvx(entry.totalPledged)} />
            <RowMetric label="Active" value={formatEvx(entry.activePledged)} />
            <RowMetric label="Record" value={`${entry.marketsWon}W / ${entry.marketsLost}L`} />
            <RowMetric label="Bets" value={entry.pledgeCount} />
        </article>
    );
}

function Avatar({ entry, size = "normal" }: { entry: EvxLeaderboardEntry; size?: "normal" | "large" }) {
    const name = getCharacterName(entry);
    const className = size === "large" ? "h-16 w-16" : "h-11 w-11";

    if (entry.selectedCharacterAvatar) {
        return (
            <Image
                src={entry.selectedCharacterAvatar}
                alt={name}
                width={size === "large" ? 64 : 44}
                height={size === "large" ? 64 : 44}
                className={`${className} rounded-xl border border-wood-100 object-cover shadow-md shadow-black/30`}
            />
        );
    }

    return (
        <div className={`${className} flex shrink-0 items-center justify-center rounded-xl border border-wood-100 bg-moss text-lg font-black text-gold`}>
            {name.slice(0, 1).toUpperCase()}
        </div>
    );
}

function Metric({ label, value, valueClassName = "text-default" }: { label: string; value: string | number; valueClassName?: string }) {
    return (
        <div className="rounded-xl border border-wood-100 bg-wood p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-default/45">{label}</p>
            <p className={`mt-1 text-lg font-black ${valueClassName}`}>{value}</p>
        </div>
    );
}

function RowMetric({ label, value, valueClassName = "text-default" }: { label: string; value: string | number; valueClassName?: string }) {
    return (
        <div className="flex items-center justify-between gap-3 lg:block">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-default/45 lg:hidden">{label}</span>
            <span className={`font-black ${valueClassName}`}>{value}</span>
        </div>
    );
}

function getPodiumStyle(rank: number) {
    return podiumStyles[(rank <= 3 ? rank : 3) as keyof typeof podiumStyles];
}

function getCharacterName(entry: EvxLeaderboardEntry) {
    return entry.selectedCharacterName || "Unknown member";
}

function formatEvx(value: number) {
    return `${new Intl.NumberFormat("en-US").format(value)} EVX`;
}

function formatSignedEvx(value: number) {
    const formatted = formatEvx(Math.abs(value));
    if (value > 0) return `+${formatted}`;
    if (value < 0) return `-${formatted}`;
    return formatted;
}

function getProfitClass(value: number) {
    if (value > 0) return "text-emerald-300";
    if (value < 0) return "text-red-300";
    return "text-default";
}
