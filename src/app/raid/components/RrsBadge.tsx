'use client'

import type { RaidParticipantRrsScore } from '@/lib/api'
import { faBolt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/react'

type ReliabilityAdjustment = {
    observedReliability: number
    neutralReliability: number
    confidence: number
    neutralWeight: number
    effectiveReliability: number
    weeksConsidered: number
    fullConfidenceAfterWeeks: number
}

type RaidParticipantRrsScoreWithAdjustment = RaidParticipantRrsScore & {
    reliabilityAdjustment?: ReliabilityAdjustment
}

function getReliabilityColor(score: number) {
    if (score >= 26.6 * 4) {
        return {
            text: 'text-legendary',
            background: 'bg-legendary-900',
            border: 'border-legendary',
        }
    }

    if (score >= 26.6 * 3) {
        return {
            text: 'text-epic',
            background: 'bg-epic-900',
            border: 'border-epic',
        }
    }

    if (score >= 26.6 * 2) {
        return {
            text: 'text-rare',
            background: 'bg-rare-900',
            border: 'border-rare',
        }
    }

    if (score >= 26.6) {
        return {
            text: 'text-uncommon',
            background: 'bg-uncommon-900',
            border: 'border-uncommon',
        }
    }

    return {
        text: 'text-common',
        background: 'bg-common-900',
        border: 'border-common',
    }
}

function formatMultiplierDelta(multiplier: number) {
    const delta = (multiplier - 1) * 100
    const absoluteDelta = Math.abs(delta)
    const formattedDelta = Number.isInteger(absoluteDelta)
        ? absoluteDelta.toFixed(0)
        : absoluteDelta.toFixed(1)

    return `${delta > 0 ? '+' : delta < 0 ? '-' : ''}${formattedDelta}%`
}

function formatScore(value: number | undefined) {
    return (value ?? 0).toFixed(2)
}

function formatPercent(value: number | undefined) {
    return `${((value ?? 0) * 100).toFixed(1)}%`
}

export function RrsBadge({
    participantScore,
    readinessScore,
}: {
    participantScore?: RaidParticipantRrsScoreWithAdjustment
    readinessScore: number
}) {
    const reliabilityColor = getReliabilityColor(readinessScore)

    const reliabilityAdjustment = participantScore?.reliabilityAdjustment
    const isLowHistory = reliabilityAdjustment !== undefined && reliabilityAdjustment.confidence < 1

    const multipliers = participantScore?.multipliers

    const hasModifiers = multipliers !== undefined && (
        multipliers.fullEnchant !== 1 ||
        multipliers.priorityRole !== 1 ||
        multipliers.alter !== 1 ||
        multipliers.signupTiming !== 1
    )

    const hasBreakdown = hasModifiers || isLowHistory

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

                    {isLowHistory ? (
                        <FontAwesomeIcon
                            icon={faBolt}
                            className="text-gold drop-shadow-[0_0_4px_rgba(245,158,11,0.85)]"
                        />
                    ) : null}
                </button>
            </PopoverTrigger>

            <PopoverContent className="border border-wood-100">
                <div className="flex min-w-72 flex-col gap-2 p-2 text-sm text-default">
                    <div className="flex items-center justify-between gap-4 border-b border-gold/40 pb-2 font-bold text-gold">
                        <span>Raid readiness score</span>
                        <span>{readinessScore.toFixed(2)}</span>
                    </div>

                    <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-xs">
                        <span className="text-default/75">Raider role</span>
                        <span className="font-semibold text-default">
                            {participantScore?.isPriorityRole ? 'Yes' : 'No'}
                        </span>

                        <span className="text-default/75">Alter</span>
                        <span className="font-semibold text-default">
                            {participantScore?.isAlter ? 'Yes' : 'No'}
                        </span>

                        <span className="text-default/75">Fully enchanted</span>
                        <span className="font-semibold text-default">
                            {participantScore?.isFullEnchanted ? 'Yes' : 'No'}
                        </span>

                        <span className="text-default/75">Coverage score</span>
                        <span className="font-semibold text-default">
                            {formatScore(participantScore?.coverageScore)}
                        </span>

                        <span className="text-default/75">Weighted weekly score</span>
                        <span className="font-semibold text-default">
                            {formatScore(participantScore?.weightedWeeklyScore)}
                        </span>

                        <span className="text-default/75">Recent reliability</span>
                        <span className="font-semibold text-default">
                            {formatScore(participantScore?.finalRecentReliability)}
                        </span>

                        <span className="text-default/75">Opportunities considered</span>
                        <span className="font-semibold text-default">
                            {participantScore?.opportunitiesConsidered ?? 0}
                        </span>

                        <span className="text-default/75">Weeks considered</span>
                        <span className="font-semibold text-default">
                            {participantScore?.weeksConsidered ?? 0}
                        </span>

                        <span className="text-default/75">Account age</span>
                        <span className="font-semibold text-default">
                            {participantScore?.weeksSinceAccountCreation ?? 0} weeks
                        </span>

                        {hasBreakdown ? (
                            <>
                                {isLowHistory && reliabilityAdjustment ? (
                                    <>
                                        <span className="col-span-2 mt-1 border-t border-gold/30 pt-1 font-semibold text-gold">
                                            New joiners adjustment
                                        </span>

                                        <span className="text-default/75">Observed reliability</span>
                                        <span className="font-semibold text-default">
                                            {formatScore(reliabilityAdjustment.observedReliability)}
                                        </span>

                                        <span className="text-default/75">Neutral baseline</span>
                                        <span className="font-semibold text-default">
                                            {formatScore(reliabilityAdjustment.neutralReliability)}
                                        </span>

                                        <span className="text-default/75">History confidence</span>
                                        <span className="font-semibold text-default">
                                            {formatPercent(reliabilityAdjustment.confidence)}
                                        </span>

                                        <span className="text-default/75">Neutral weight</span>
                                        <span className="font-semibold text-default">
                                            {formatPercent(reliabilityAdjustment.neutralWeight)}
                                        </span>

                                        <span className="text-default/75">Raid history</span>
                                        <span className="font-semibold text-default">
                                            {reliabilityAdjustment.weeksConsidered} / {reliabilityAdjustment.fullConfidenceAfterWeeks} weeks
                                        </span>

                                        <span className="text-default/75">Boosted rrs</span>
                                        <span className="font-bold text-success">
                                            {formatScore(reliabilityAdjustment.effectiveReliability)}
                                        </span>

                                        <span className="col-span-2 text-[11px] leading-snug text-default/60">
                                            New joiners are partially weighted toward the neutral baseline until enough raid history exists.
                                        </span>
                                    </>
                                ) : null}

                                {hasModifiers && multipliers ? (
                                    <>
                                        <span className="col-span-2 mt-1 border-t border-gold/30 pt-1 font-semibold text-gold">
                                            Multipliers
                                        </span>

                                        {multipliers.fullEnchant !== 1 ? (
                                            <>
                                                <span className="text-default/75">Full enchant</span>
                                                <span className={`font-semibold ${multipliers.fullEnchant > 1 ? 'text-success' : 'text-danger'}`}>
                                                    {formatMultiplierDelta(multipliers.fullEnchant)}
                                                </span>
                                            </>
                                        ) : null}

                                        {multipliers.priorityRole !== 1 ? (
                                            <>
                                                <span className="text-default/75">Raider role</span>
                                                <span className={`font-semibold ${multipliers.priorityRole > 1 ? 'text-success' : 'text-danger'}`}>
                                                    {formatMultiplierDelta(multipliers.priorityRole)}
                                                </span>
                                            </>
                                        ) : null}

                                        {multipliers.alter !== 1 ? (
                                            <>
                                                <span className="text-default/75">Alter role</span>
                                                <span className={`font-semibold ${multipliers.alter > 1 ? 'text-success' : 'text-danger'}`}>
                                                    {formatMultiplierDelta(multipliers.alter)}
                                                </span>
                                            </>
                                        ) : null}

                                        {multipliers.signupTiming !== 1 ? (
                                            <>
                                                <span className="text-default/75">Signup timing</span>
                                                <span className={`font-semibold ${multipliers.signupTiming > 1 ? 'text-success' : 'text-danger'}`}>
                                                    {formatMultiplierDelta(multipliers.signupTiming)}
                                                </span>
                                            </>
                                        ) : null}
                                    </>
                                ) : null}
                            </>
                        ) : null}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}