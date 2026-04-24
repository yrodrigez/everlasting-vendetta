import { GUILD_NAME } from "@/util/constants";
import { RaidParticipant } from "@/app/raid/api/types";
import type { RaidParticipantRrsScore } from "@/lib/api";

export type RaidParticipantWithPosition = RaidParticipant & {
    position: number;
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

export const createParticipantScoreKey = (characterName: string, realmSlug: string) =>
    `${characterName.toLowerCase()}-${realmSlug.toLowerCase()}`

const getCharacterKey = (p: RaidParticipant) => {
    const character = p.member.character
    return createParticipantScoreKey(character.name, character.realm.slug)
}

const getStatusRank = (p: RaidParticipant) =>
    ['confirmed', 'late', 'tentative'].includes(p.details?.status ?? 'declined') ? 0 : 1

const getParticipantScore = (p: RaidParticipant, participantScoreByCharacterKey: Map<string, RaidParticipantRrsScore>) =>
    participantScoreByCharacterKey.get(getCharacterKey(p))

const getParticipationCount = (p: RaidParticipant, participantScoreByCharacterKey: Map<string, RaidParticipantRrsScore>) =>
    getParticipantScore(p, participantScoreByCharacterKey)?.participationCount ?? 0

const isFullyEnchanted = (p: RaidParticipant, participantScoreByCharacterKey: Map<string, RaidParticipantRrsScore>) =>
    getParticipantScore(p, participantScoreByCharacterKey)?.isFullEnchanted ?? false

const getEnchantRank = (p: RaidParticipant, participantScoreByCharacterKey: Map<string, RaidParticipantRrsScore>) =>
    isFullyEnchanted(p, participantScoreByCharacterKey) ? 0 : 1

const getGuildRank = (p: RaidParticipant) =>
    p.member.character.guild?.name === GUILD_NAME ? 0 : 1

const getCreatedAtTs = (p: RaidParticipant) =>
    new Date(p.created_at).getTime()

const compareRaidCreator =
    (createdById: number) =>
        (a: RaidParticipant, b: RaidParticipant) => {
            const aIsCreator = a.member.id === createdById
            const bIsCreator = b.member.id === createdById

            if (aIsCreator === bIsCreator) return 0

            return aIsCreator ? -1 : 1
        }


export const getRaidReadinessScore = (
    participant: RaidParticipant,
    participantScoreByCharacterKey: Map<string, RaidParticipantRrsScore>
) => {
    return getParticipantScore(participant, participantScoreByCharacterKey)?.rrs ?? 0
}

const getIsGuildMember = (p: RaidParticipant) =>
    p.member.character.guild?.name === GUILD_NAME


export const createParticipantsComparator = (participantScoreByCharacterKey: Map<string, RaidParticipantRrsScore>, createdById: number) => chainComparators<RaidParticipant>(
    compareRaidCreator(createdById),
    compareAsc(getStatusRank),
    compareDesc(p => getIsGuildMember(p) ? 1 : 0),
    compareDesc(p => getRaidReadinessScore(p, participantScoreByCharacterKey)),
    compareDesc(p => getParticipationCount(p, participantScoreByCharacterKey)),
    compareAsc(p => getEnchantRank(p, participantScoreByCharacterKey)),
    compareAsc(getGuildRank),
    compareAsc(getCreatedAtTs)
)
