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


const FULL_ENCHANT_MULTIPLIER = 1.175
const PRIORITY_ROLE_MULTIPLIER = 1.135

export const getRaidReadinessScore = (
    participant: RaidParticipant,
    reliabilityByCharacterName: Map<string, number>,
    fullEnchantByCharacterName: Map<string, boolean>
) => {
    const reliability = getReliability(participant, reliabilityByCharacterName)

    const enchantMultiplier = isFullyEnchanted(participant, fullEnchantByCharacterName)
        ? FULL_ENCHANT_MULTIPLIER
        : 1

    const priorityMultiplier = isPriorityParticipant(participant)
        ? PRIORITY_ROLE_MULTIPLIER
        : 1

    return reliability * enchantMultiplier * priorityMultiplier
}

const getIsGuildMember = (p: RaidParticipant) =>
    p.member.character.guild?.name === GUILD_NAME


export const createParticipantsComparator = (reliabilityByCharacterName: Map<string, number>, fullEnchantByCharacterName: Map<string, boolean>, createdById: number) => chainComparators<RaidParticipant>(
    compareRaidCreator(createdById),
    compareAsc(getStatusRank),
    compareDesc(p => getIsGuildMember(p) ? 1 : 0),
    compareDesc(p => getRaidReadinessScore(p, reliabilityByCharacterName, fullEnchantByCharacterName)),
    compareDesc(p => getReliability(p, reliabilityByCharacterName)),
    compareAsc(p => getEnchantRank(p, fullEnchantByCharacterName)),
    compareAsc(getGuildRank),
    compareAsc(getCreatedAtTs)
)