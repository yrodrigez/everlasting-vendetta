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

const NON_PRIORITY_OVERRIDE_MIN_RELIABILITY = 80
const NON_PRIORITY_OVERRIDE_MIN_DIFF = 15
const NON_PRIORITY_ENCHANT_OVERRIDE_MIN_RELIABILITY = 70
const NON_PRIORITY_ENCHANT_OVERRIDE_MIN_DIFF = 10

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
    p.details?.status === 'confirmed' ? 0 : 1

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

const comparePriorityWithOverride = (
    a: RaidParticipant,
    b: RaidParticipant,
    reliabilityByCharacterName: Map<string, number>,
    fullEnchantByCharacterName: Map<string, boolean>,
    createdById: number
) => {

    // if its the creator should always be priority, no matter the reliability or enchantment, unless the non-priority participant has significantly higher reliability and enchantment, then the creator should be deprioritized
    if (createdById === a.member.id || createdById === b.member.id) {
        return createdById === a.member.id ? -1 : 1
    }

    const aPriority = isPriorityParticipant(a)
    const bPriority = isPriorityParticipant(b)

    if (aPriority === bPriority) {
        return 0
    }

    const priorityParticipant = aPriority ? a : b
    const nonPriorityParticipant = aPriority ? b : a

    const priorityReliability = getReliability(priorityParticipant, reliabilityByCharacterName)
    const nonPriorityReliability = getReliability(nonPriorityParticipant, reliabilityByCharacterName)

    const priorityEnchanted = isFullyEnchanted(priorityParticipant, fullEnchantByCharacterName)
    const nonPriorityEnchanted = isFullyEnchanted(nonPriorityParticipant, fullEnchantByCharacterName)

    const reliabilityDiff = nonPriorityReliability - priorityReliability

    const nonPriorityOverrides =
        (nonPriorityReliability >= NON_PRIORITY_OVERRIDE_MIN_RELIABILITY && reliabilityDiff >= NON_PRIORITY_OVERRIDE_MIN_DIFF) ||
        (
            nonPriorityReliability >= NON_PRIORITY_ENCHANT_OVERRIDE_MIN_RELIABILITY &&
            nonPriorityEnchanted &&
            reliabilityDiff >= NON_PRIORITY_ENCHANT_OVERRIDE_MIN_DIFF &&
            !priorityEnchanted
        )

    if (nonPriorityOverrides) {
        return aPriority ? 1 : -1
    }

    return aPriority ? -1 : 1
}

export const createParticipantsComparator = (reliabilityByCharacterName: Map<string, number>, fullEnchantByCharacterName: Map<string, boolean>, createdById: number) => chainComparators<RaidParticipant>(
    compareAsc(getStatusRank),
    (a, b) => comparePriorityWithOverride(a, b, reliabilityByCharacterName, fullEnchantByCharacterName, createdById),
    compareDesc(p => getReliability(p, reliabilityByCharacterName)),
    compareAsc(p => getEnchantRank(p, fullEnchantByCharacterName)),
    compareAsc(getGuildRank),
    compareAsc(getCreatedAtTs)
)