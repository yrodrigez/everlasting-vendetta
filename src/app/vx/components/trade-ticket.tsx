import { Button } from "@/components/Button";
import { Card, CardBody } from "@/components/card";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import type { PredictionMarketDetails, PredictionPledgeDetails } from "@/lib/api";
import { SelectItem } from "@heroui/react";
import { Gem } from "lucide-react";
import { estimateReturn, formatEvx, formatMarketType, getMarketMessage, isMarketBettable, MAX_BET, MIN_BET } from "./vx-exchange.utils";

export function TradeTicket({
    market,
    outcomeId,
    amount,
    isPending,
    existingBet,
    onOutcomeChange,
    onAmountChange,
    onBet,
}: {
    market: PredictionMarketDetails;
    outcomeId: string;
    amount: number;
    isPending: boolean;
    existingBet?: PredictionPledgeDetails;
    onOutcomeChange: (outcomeId: string) => void;
    onAmountChange: (amount: number) => void;
    onBet: () => void;
}) {
    const outcomes = market.outcomes.slice().sort((a, b) => a.sortOrder - b.sortOrder);
    const selectedOutcome = outcomes.find((outcome) => outcome.id === outcomeId);
    const bettable = isMarketBettable(market);
    const amountInvalid = amount < MIN_BET || amount > MAX_BET;
    const projectedReturn = estimateReturn(market, outcomeId, amount);

    return (
        <Card className="border border-wood-100 bg-wood shadow-xl shadow-black/30 lg:sticky lg:top-4 rounded-md">
            <CardBody className="p-4">
                <div className="border-b border-wood-100 pb-4">
                    <p className="line-clamp-2 font-black text-default">{selectedOutcome?.label ?? "Select outcome"}</p>
                    <p className="mt-1 text-xs text-default/55">{formatMarketType(market.type)}</p>
                </div>
                {!existingBet && (
                    <>
                        {market.type === 'YES_NO' && (
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                {outcomes.slice(0, 2).map((outcome, index) => (
                                    <Button
                                        key={outcome.id}
                                        onPress={() => onOutcomeChange(outcome.id)}
                                        className={outcomeId === outcome.id
                                            ? index === 0 ? "border-emerald-500 bg-emerald-700 text-white" : "border-red-500 bg-red-700 text-white"
                                            : "border-wood-100 bg-wood text-default/70 hover:text-gold"}
                                    >
                                        {outcome.label} {Math.round(outcome.impliedProbability * 100)}%
                                    </Button>
                                ))}
                            </div>
                        )}

                        {market.type !== 'YES_NO' && (
                            <Select
                                label="Outcome"
                                className="mt-4"
                                selectedKeys={outcomeId ? [outcomeId] : []}
                                onSelectionChange={(keys) => onOutcomeChange(String(Array.from(keys)[0] ?? ""))}
                            >
                                {outcomes.map((outcome) => (
                                    <SelectItem key={outcome.id}>{outcome.label}</SelectItem>
                                ))}
                            </Select>
                        )}

                        <Input
                            type="number"
                            label="Amount"
                            min={MIN_BET}
                            max={MAX_BET}
                            value={String(amount)}
                            onValueChange={(value) => onAmountChange(Number(value))}
                            className="mt-6"
                            startContent={<span className="text-default/40">EVX</span>}
                        />
                    </>
                )}

                {existingBet?.status === 'WON' ? (
                    <div className="mt-4 rounded-xl border border-emerald-500 bg-emerald-700 p-4 text-sm text-white font-bold">
                        <span className="text-emerald-300">Congratulations!</span> Your bet won. You earned {formatEvx(projectedReturn)}.
                    </div>
                ) : existingBet?.status === 'LOST' ? (
                    <div className="mt-4 rounded-xl border border-red-500 bg-red-800 p-4 text-sm text-white font-bold">
                        <span className="text-red-300">Better luck next time!</span> Your bet lost. You lost {formatEvx(existingBet.amount)}.
                    </div>
                ) : existingBet ? (
                    <div className="mt-4 rounded-xl border border-gold bg-moss p-4 text-sm text-default font-bold flex gap-2">
                        <Gem size={24} className="text-gold" /> <p>You have an active bet of <b className="text-gold font-bold">{formatEvx(existingBet.amount)}</b> on <b className="text-gold font-bold">{existingBet.outcomeLabel}</b>. Estimated return is <b className="text-gold font-bold">{formatEvx(projectedReturn)}</b>.</p>
                    </div>
                ) : (
                    <div className="mt-4 rounded-xl border border-wood-100 bg-wood p-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-default/55">To win</span>
                            <span className="text-2xl font-black text-emerald-300">{formatEvx(projectedReturn)}</span>
                        </div>
                        <p className="mt-1 text-xs text-default/45">Pari-mutuel estimate. Final payout depends on the pool at resolution.</p>
                    </div>
                )}

                {!bettable ? <p className="mt-4 rounded-xl border border-wood-100 bg-wood-900 p-3 text-sm text-default/75">{getMarketMessage(market)}</p> : null}
                {amountInvalid && !existingBet && bettable ? <p className="mt-3 text-sm text-red-300">Bet between {formatEvx(MIN_BET)} and {formatEvx(MAX_BET)}.</p> : null}

                {!existingBet && (
                    <Button
                        isDisabled={!bettable || !selectedOutcome || amountInvalid || isPending}
                        isLoading={isPending}
                        onPress={onBet}
                        className="mt-5 w-full border-moss-100 bg-moss px-4 py-4 text-base font-black text-gold hover:bg-moss-100 disabled:bg-wood disabled:text-default/35"
                    >
                        Place Bet
                    </Button>
                )}
            </CardBody>
        </Card>
    );
}
