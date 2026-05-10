import { Button } from "@/components/Button";
import { formatEvx } from "./vx-exchange.utils";
import Link from "next/link";

export function TopBar({
    headingClassName,
    balance,
    marketCount,
    openMarketCount,
    betCount,
}: {
    headingClassName: string;
    balance: number | undefined;
    marketCount: number;
    openMarketCount: number;
    betCount: number;
}) {
    return (
        <section className="rounded-md border border-wood-100 bg-wood p-4 shadow-xl shadow-black/30">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-gold/80">Vendetta Exchange</p>
                    <h1 className={`${headingClassName} mt-1 text-2xl font-bold text-gold sm:text-3xl`}>Bet the guild ledger</h1>
                    <p className="mt-1 text-sm text-default/60">Pick a market, choose an outcome, and place a bet with EVX.</p>
                    <Button
                        as="a"
                        href="/vx/leaderboard"
                        size="sm"
                        className="mt-3 ">
                        View leaderboard
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[520px]">
                    <Stat label="Balance" value={formatEvx(balance)} highlight />
                    <Stat label="Markets" value={marketCount} />
                    <Stat label="Open" value={openMarketCount} tone="text-emerald-300" />
                    <Stat label="My Bets" value={betCount} />
                </div>
            </div>
        </section>
    );
}

function Stat({ label, value, highlight, tone }: { label: string; value: string | number; highlight?: boolean; tone?: string }) {
    return (
        <div className={`rounded-xl border px-4 py-3 ${highlight ? "border-moss-100 bg-moss" : "border-wood-100 bg-wood"}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-default/45">{label}</p>
            <p className={`mt-1 text-xl font-black ${tone ?? (highlight ? "text-gold" : "text-default")}`}>{value}</p>
        </div>
    );
}
