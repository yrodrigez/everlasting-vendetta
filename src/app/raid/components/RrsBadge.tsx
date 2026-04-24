'use client'

import type { RaidParticipantRrsScore } from "@/lib/api";
import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";

function getReliabilityColor(score: number) {
    if (score >= (26.6 * 4)) return {
        text: 'text-legendary',
        background: 'bg-legendary-900',
        border: 'border-legendary',
    }

    if (score >= 26.6 * 3) return {
        text: 'text-epic',
        background: 'bg-epic-900',
        border: 'border-epic',
    }

    if (score >= (26.6 * 2)) return {
        text: 'text-rare',
        background: 'bg-rare-900',
        border: 'border-rare',
    }

    if (score >= 26.6) return {
        text: 'text-uncommon',
        background: 'bg-uncommon-900',
        border: 'border-uncommon',
    }

    return {
        text: 'text-common',
        background: 'bg-common-900',
        border: 'border-common',
    }
}

function getNewJoinerBoost(weeksSinceAccountCreation: number) {
    if (weeksSinceAccountCreation <= 1) return 45
    if (weeksSinceAccountCreation === 2) return 50
    if (weeksSinceAccountCreation === 3) return 55

    return 0
}

function formatMultiplierDelta(multiplier: number) {
    const delta = (multiplier - 1) * 100
    const absoluteDelta = Math.abs(delta)
    const formattedDelta = Number.isInteger(absoluteDelta) ? absoluteDelta.toFixed(0) : absoluteDelta.toFixed(1)

    return `${delta > 0 ? '+' : '-'}${formattedDelta}%`
}

export function RrsBadge({ participantScore, readinessScore }: {
    participantScore?: RaidParticipantRrsScore,
    readinessScore: number,
}) {
    const reliabilityColor = getReliabilityColor(readinessScore)
    const newJoinerBoost = getNewJoinerBoost(participantScore?.weeksSinceAccountCreation ?? 0)

    const multipliers = participantScore?.multipliers;
    const hasModifiers = multipliers && (
        multipliers.fullEnchant !== 1 || 
        multipliers.priorityRole !== 1 || 
        multipliers.alter !== 1 || 
        multipliers.signupTiming !== 1
    );

    return (
        <Popover placement="top" showArrow>
            <PopoverTrigger>
                <button
                    type="button"
                    className="flex w-20 cursor-pointer items-center justify-between gap-1 rounded-full outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-gold"
                    aria-label={`Raid readiness score ${readinessScore.toFixed(2)}`}
                >
                    <span
                        className={`${reliabilityColor.text} ${reliabilityColor.background} px-2 py-1 text-xs rounded-full border font-bold ${reliabilityColor.border} flex items-center justify-center min-w-14 max-w-14`}
                    >
                        {Math.round(readinessScore)}
                    </span>
                    {newJoinerBoost > 0 ? (
                        <FontAwesomeIcon
                            icon={faBolt}
                            className="text-gold drop-shadow-[0_0_4px_rgba(245,158,11,0.85)]"
                            title="New joiner boost applied"
                        />
                    ) : null}
                </button>
            </PopoverTrigger>
            <PopoverContent className="border border-wood-100">
                <div className="flex min-w-60 flex-col gap-2 p-2 text-sm text-default">
                    <div className="flex items-center justify-between gap-4 border-b border-gold/40 pb-2 font-bold text-gold">
                        <span>Raid readiness score</span>
                        <span>{readinessScore.toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-xs">
                        <span className="text-default/75">Raider role</span>
                        <span className="font-semibold text-default">{participantScore?.isPriorityRole ? 'Yes' : 'No'}</span>
                        <span className="text-default/75">Alter</span>
                        <span className="font-semibold text-default">{participantScore?.isAlter ? 'Yes' : 'No'}</span>
                        <span className="text-default/75">Fully enchanted</span>
                        <span className="font-semibold text-default">{participantScore?.isFullEnchanted ? 'Yes' : 'No'}</span>
                        <span className="text-default/75">Participation</span>
                        <span className="font-semibold text-default">{(participantScore?.participationCount ?? 0).toFixed(2)}</span>
                        <span className="text-default/75">Total raids</span>
                        <span className="font-semibold text-default">{participantScore?.totalRaids ?? 0}</span>
                        <span className="text-default/75">Account age</span>
                        <span className="font-semibold text-default">{participantScore?.weeksSinceAccountCreation ?? 0} weeks</span>
                        {newJoinerBoost > 0 ? (
                            <>
                                <span className="text-gold">New joiner boost</span>
                                <span className="font-bold text-gold">{newJoinerBoost}</span>
                            </>
                        ) : null}
                        {hasModifiers && (
                            <>
                                <span className="col-span-2 mt-1 border-t border-gold/30 pt-1 text-gold font-semibold">Modifiers</span>
                                {multipliers.fullEnchant !== 1 && (
                                    <>
                                        <span className="text-default/75">Full enchant</span>
                                        <span className={`font-semibold ${multipliers.fullEnchant > 1 ? 'text-success' : 'text-danger'}`}>
                                            {formatMultiplierDelta(multipliers.fullEnchant)}
                                        </span>
                                    </>
                                )}
                                {multipliers.priorityRole !== 1 && (
                                    <>
                                        <span className="text-default/75">Raider role</span>
                                        <span className={`font-semibold ${multipliers.priorityRole > 1 ? 'text-success' : 'text-danger'}`}>
                                            {formatMultiplierDelta(multipliers.priorityRole)}
                                        </span>
                                    </>
                                )}
                                {multipliers.alter !== 1 && (
                                    <>
                                        <span className="text-default/75">Alter role</span>
                                        <span className={`font-semibold ${multipliers.alter > 1 ? 'text-success' : 'text-danger'}`}>
                                            {formatMultiplierDelta(multipliers.alter)}
                                        </span>
                                    </>
                                )}
                                {multipliers.signupTiming !== 1 && (
                                    <>
                                        <span className="text-default/75">Signup timing</span>
                                        <span className={`font-semibold ${multipliers.signupTiming > 1 ? 'text-success' : 'text-danger'}`}>
                                            {formatMultiplierDelta(multipliers.signupTiming)}
                                        </span>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
