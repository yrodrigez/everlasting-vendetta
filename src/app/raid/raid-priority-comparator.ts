import { GUILD_NAME } from "@/util/constants";
import { RaidParticipant } from "@/app/raid/api/types";

export type RaidParticipantWithPosition = RaidParticipant & {
    position: number;
}

export type ParticipantGearScore = {
    characterName: string;
    isFullEnchanted: boolean;
}

export type ParticipantReliability = {
    characterName: string;
    finalRecentReliability: number;
}
const PRIORITY_ROLES = ['GUILD_MASTER', 'COMRADE', 'RAID_LEADER', 'LOOT_MASTER', 'RAIDER'] as const

const CROSS_BUCKET_CLOSE_DIFF = 10
const CROSS_BUCKET_CLOSE_MIN_RELIABILITY = 70
const SAME_BUCKET_DECISIVE_RELIABILITY_DIFF = 10

const comparePriority = (a: RaidParticipant, b: RaidParticipant) => {
    const aPriority = isPriorityParticipant(a)
    const bPriority = isPriorityParticipant(b)

    if (aPriority === bPriority) return 0

    return aPriority ? -1 : 1
}

const compareValues = (a: number | string, b: number | string) => {
    if (a < b) return -1
    if (a > b) return 1
    return 0
}

const compareAsc =
    <T,>(selector: (value: T) => number | string) =>
        (a: T, b: T) =>
            compareValues(selector(a), selector(b))

const compareDesc =
    <T,>(selector: (value: T) => number | string) =>
        (a: T, b: T) =>
            compareValues(selector(b), selector(a))

const chainComparators =
    <T,>(...comparators: Array<(a: T, b: T) => number>) =>
        (a: T, b: T) => {
            for (const comparator of comparators) {
                const result = comparator(a, b)
                if (result !== 0) return result
            }
            return 0
        }

const getCharacterKey = (p: RaidParticipant) =>
    p.member.character.name.toLowerCase()

const getStatusRank = (p: RaidParticipant) =>
    ['confirmed', 'late', 'tentative'].includes(p.details?.status ?? 'declined') ? 0 : 1

const getReliability = (p: RaidParticipant, reliabilityByCharacterName: Map<string, number>) =>
    reliabilityByCharacterName.get(getCharacterKey(p)) ?? 0

const isFullyEnchanted = (p: RaidParticipant, fullEnchantByCharacterName: Map<string, boolean>) =>
    fullEnchantByCharacterName.get(getCharacterKey(p)) ?? false

const getEnchantRank = (p: RaidParticipant, fullEnchantByCharacterName: Map<string, boolean>) =>
    isFullyEnchanted(p, fullEnchantByCharacterName) ? 0 : 1

const getGuildRank = (p: RaidParticipant) =>
    p.member.character.guild?.name === GUILD_NAME ? 0 : 1

const getCreatedAtTs = (p: RaidParticipant) =>
    new Date(p.created_at).getTime()

const isPriorityParticipant = (p: RaidParticipant) => {
    const hasPriorityRole =
        p.roles?.some(role =>
            PRIORITY_ROLES.includes(role as (typeof PRIORITY_ROLES)[number])
        ) ?? false


    return hasPriorityRole
}

const compareRaidCreator =
    (createdById: number) =>
        (a: RaidParticipant, b: RaidParticipant) => {
            const aIsCreator = a.member.id === createdById
            const bIsCreator = b.member.id === createdById

            if (aIsCreator === bIsCreator) return 0

            return aIsCreator ? -1 : 1
        }

const getReliabilityBucketRank = (reliability: number) => {

    if (reliability >= 80) return 0
    if (reliability >= 50) return 1
    if (reliability >= 30) return 2
    if (reliability >= 10) return 3

    return 4
}

const compareReliabilityEnchantAndPriority = (
    reliabilityByCharacterName: Map<string, number>,
    fullEnchantByCharacterName: Map<string, boolean>
) =>
    (a: RaidParticipant, b: RaidParticipant) => {
        const aReliability = getReliability(a, reliabilityByCharacterName)
        const bReliability = getReliability(b, reliabilityByCharacterName)

        const aBucketRank = getReliabilityBucketRank(aReliability)
        const bBucketRank = getReliabilityBucketRank(bReliability)

        const aEnchanted = isFullyEnchanted(a, fullEnchantByCharacterName)
        const bEnchanted = isFullyEnchanted(b, fullEnchantByCharacterName)

        const reliabilityDiff = Math.abs(aReliability - bReliability)

        const sameBucket = aBucketRank === bBucketRank

        const closeAcrossBucketBoundary =
            Math.abs(aBucketRank - bBucketRank) === 1 &&
            Math.min(aReliability, bReliability) >= CROSS_BUCKET_CLOSE_MIN_RELIABILITY &&
            reliabilityDiff <= CROSS_BUCKET_CLOSE_DIFF

        const shouldTreatAsSameReliabilityGroup =
            sameBucket || closeAcrossBucketBoundary

        if (!shouldTreatAsSameReliabilityGroup) {
            return compareValues(aBucketRank, bBucketRank)
        }

        if (aEnchanted !== bEnchanted) {
            return aEnchanted ? -1 : 1
        }

        if (reliabilityDiff >= SAME_BUCKET_DECISIVE_RELIABILITY_DIFF) {
            return compareValues(bReliability, aReliability)
        }

        const priorityResult = comparePriority(a, b)

        if (priorityResult !== 0) {
            return priorityResult
        }

        return compareValues(bReliability, aReliability)
    }

export const createParticipantsComparator = (reliabilityByCharacterName: Map<string, number>, fullEnchantByCharacterName: Map<string, boolean>, createdById: number) => chainComparators<RaidParticipant>(
    compareRaidCreator(createdById),
    compareAsc(getStatusRank),
    compareReliabilityEnchantAndPriority(reliabilityByCharacterName, fullEnchantByCharacterName),
    compareDesc(p => getReliability(p, reliabilityByCharacterName)),
    compareAsc(p => getEnchantRank(p, fullEnchantByCharacterName)),
    compareAsc(getGuildRank),
    compareAsc(getCreatedAtTs)
)