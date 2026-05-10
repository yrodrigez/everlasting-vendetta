import { Button } from "@/components/Button";
import { Card, CardBody } from "@/components/card";
import type { PredictionMarketDetails, PredictionPledgeDetails } from "@/lib/api";
import { PledgeChart } from "./pledge-chart";
import { StatusBadge } from "./status-badge";
import { TradeTicket } from "./trade-ticket";
import { formatDate, formatEvx, formatMarketType, getMarketMessage, getResolvedOutcome } from "./vx-exchange.utils";

export function MarketDetailView({
    market,
    amount,
    outcomeId,
    isGuildMaster,
    isPending,
    adminPending,
    existingBet,
    onAmountChange,
    onOutcomeChange,
    onBet,
    onBack,
    onOpen,
    onFinalize,
    onCancel,
}: {
    market: PredictionMarketDetails;
    amount: number;
    outcomeId: string;
    isGuildMaster: boolean;
    isPending: boolean;
    adminPending: boolean;
    existingBet?: PredictionPledgeDetails;
    onAmountChange: (amount: number) => void;
    onOutcomeChange: (outcomeId: string) => void;
    onBet: () => void;
    onBack: () => void;
    onOpen: () => void;
    onFinalize: () => void;
    onCancel: () => void;
}) {
    const outcomes = market.outcomes.slice().sort((a, b) => a.sortOrder - b.sortOrder);
    const resolvedOutcome = getResolvedOutcome(market);

    return (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0">
                <Button onPress={onBack} className="mb-5 border-wood-100 bg-wood text-default hover:text-gold">
                    Back to markets
                </Button>

                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <StatusBadge status={market.status} />
                            <span className="text-sm font-semibold text-default/55">{formatMarketType(market.type)}</span>
                        </div>
                        <h2 className="text-3xl font-black leading-tight text-default">{market.title}</h2>
                        {market.description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-default/65">{market.description}</p> : null}
                    </div>
                </div>

                <Card className="mt-6 border border-wood-100 bg-wood rounded-md">
                    <CardBody className="p-5">
                        <div className="grid gap-3 sm:grid-cols-4">
                            <Metric label="Volume" value={formatEvx(market.totalPool)} />
                            <Metric label="Bets" value={market.pledgeCount} />
                            <Metric label="Closes" value={formatDate(market.closesAt)} />
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-default/40">Status</p>
                                <p className="mt-1 text-sm font-bold text-default/70">{getMarketMessage(market)}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {resolvedOutcome ? (
                    <div className="mt-5 rounded-md border border-gold/55 bg-wood p-4 font-bold text-default shadow-lg shadow-black/20">
                        <span className="text-gold">Resolved outcome:</span> {resolvedOutcome.label}
                    </div>
                ) : null}

                <PledgeChart market={market} />

                <Card className="mt-8 border border-wood-100 bg-wood rounded-md">
                    <CardBody className="divide-y divide-wood-100 p-0">
                        {outcomes.map((outcome) => {
                            const percent = Math.round(outcome.impliedProbability * 100);
                            return (
                                <div key={outcome.id} className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_90px_200px] sm:items-center">
                                    <div className="min-w-0">
                                        <p className="line-clamp-1 text-lg font-black text-default">{outcome.label}</p>
                                        <p className="mt-1 text-sm text-default/50">{formatEvx(outcome.totalPledged)} Vol.</p>
                                    </div>
                                    <div className="text-3xl font-black text-default">{percent}%</div>
                                    <Button
                                        onPress={() => onOutcomeChange(outcome.id)}
                                        className={outcomeId === outcome.id ? "border-emerald-500 bg-emerald-700 text-white" : "border-wood-100 bg-wood text-default/75 hover:text-gold"}
                                    >
                                        Select
                                    </Button>
                                </div>
                            );
                        })}
                    </CardBody>
                </Card>

                {isGuildMaster ? (
                    <Card className="mt-6 border border-gold/25 bg-wood rounded-md">
                        <CardBody className="p-4">
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-gold/75">Guild master controls</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Button isDisabled={market.status !== "DRAFT" || adminPending} onPress={onOpen} className="border-moss-100 bg-moss text-gold hover:bg-moss-100">Open Market</Button>
                                <Button isDisabled={!outcomeId || !(market.status === "OPEN" || market.status === "LOCKED") || adminPending} onPress={onFinalize} className="border-emerald-500/50 bg-wood text-emerald-300 hover:bg-emerald-700 hover:text-white">Finalize Selected Outcome</Button>
                                <Button className="rounded-sm" isDisabled={!(market.status === "DRAFT" || market.status === "OPEN" || market.status === "LOCKED") || adminPending} onPress={onCancel} color="danger">Cancel Market</Button>
                            </div>
                        </CardBody>
                    </Card>
                ) : null}
            </div>

            <TradeTicket
                market={market}
                outcomeId={outcomeId}
                amount={amount}
                isPending={isPending}
                existingBet={existingBet}
                onOutcomeChange={onOutcomeChange}
                onAmountChange={onAmountChange}
                onBet={onBet}
            />
        </section>
    );
}

function Metric({ label, value }: { label: string; value: string | number }) {
    return (
        <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-default/40">{label}</p>
            <p className="mt-1 text-lg font-black text-default">{value}</p>
        </div>
    );
}
