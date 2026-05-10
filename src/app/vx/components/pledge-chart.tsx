import { Card, CardBody } from "@/components/card";
import type { PredictionMarketDetails } from "@/lib/api";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { formatDate, formatEvx } from "./vx-exchange.utils";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const OUTCOME_COLORS = ["#60a5fa", "#f59e0b", "#22c55e", "#f97316", "#ef4444", "#a78bfa"];

export function PledgeChart({ market }: { market: PredictionMarketDetails }) {
    const outcomes = market.outcomes.slice().sort((a, b) => a.sortOrder - b.sortOrder);
    const pledges = market.pledges.slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const totalsByOutcome = new Map(outcomes.map((outcome) => [outcome.id, 0]));
    const startTime = new Date(market.createdAt).getTime();
    const endTime = Math.max(
        new Date(market.updatedAt).getTime(),
        pledges.at(-1) ? new Date(pledges.at(-1)!.createdAt).getTime() : startTime,
        startTime + 60 * 60 * 1000,
    );
    const dataByOutcome = new Map(outcomes.map((outcome) => [outcome.id, [{ x: startTime, y: 0 }]]));

    for (const pledge of pledges) {
        const pledgeTime = new Date(pledge.createdAt).getTime();
        totalsByOutcome.set(pledge.outcomeId, (totalsByOutcome.get(pledge.outcomeId) ?? 0) + pledge.amount);

        for (const outcome of outcomes) {
            dataByOutcome.get(outcome.id)?.push({
                x: pledgeTime,
                y: totalsByOutcome.get(outcome.id) ?? 0,
            });
        }
    }

    for (const outcome of outcomes) {
        dataByOutcome.get(outcome.id)?.push({
            x: endTime,
            y: totalsByOutcome.get(outcome.id) ?? 0,
        });
    }

    const series = outcomes.map((outcome) => ({ name: outcome.label, data: dataByOutcome.get(outcome.id) ?? [] }));

    const options: ApexOptions = {
        chart: {
            type: "line",
            toolbar: { show: false },
            zoom: { enabled: false },
            background: "transparent",
            foreColor: "rgba(245, 238, 220, 0.65)",
        },
        colors: OUTCOME_COLORS,
        dataLabels: { enabled: false },
        grid: { borderColor: "rgba(171, 119, 73, 0.24)", strokeDashArray: 3 },
        legend: { labels: { colors: "rgba(245, 238, 220, 0.75)" }, fontWeight: 700 },
        markers: { size: pledges.length ? 0 : 3, strokeWidth: 0 },
        stroke: { curve: "smooth", width: 2 },
        tooltip: { enabled: false },
        xaxis: {
            type: "datetime",
            axisBorder: { color: "rgba(171, 119, 73, 0.35)" },
            axisTicks: { color: "rgba(171, 119, 73, 0.35)" },
            labels: { style: { colors: "rgba(245, 238, 220, 0.55)" } },
        },
        yaxis: {
            labels: {
                formatter: (value) => `${Math.round(value)}`,
                style: { colors: "rgba(245, 238, 220, 0.55)" },
            },
        },
    };

    return (
        <Card className="mt-6 border border-wood-100 bg-wood shadow-lg shadow-black/25 rounded-md">
            <CardBody className="p-4">
                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-gold/75">Pledge movement</p>
                        <h3 className="text-xl font-black text-default">Outcome pool over time</h3>
                    </div>
                    <p className="text-xs text-default/50">{formatEvx(market.totalPool)} Vol. · {market.pledgeCount} bets</p>
                </div>
                <Chart options={options} series={series} type="line" height={310} />
            </CardBody>
        </Card>
    );
}
