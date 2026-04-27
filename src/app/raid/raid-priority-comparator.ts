import { GUILD_NAME } from "@/util/constants";
import { RaidParticipant } from "@/app/raid/api/types";
import type { RaidParticipantRrsScore } from "@/lib/api";

export type RaidParticipantWithPosition = RaidParticipant & {
    position: number;
    hasCompositionSpot?: boolean;
    assignedCompositionRole?: CompositionRole;
}

export type RaidComposition = {
    tanks?: number;
    healers?: number;
    dps?: number;
    raid_lead?: number;
} | null

export type CompositionRole = 'tank' | 'healer' | 'dps'

type AssignedCompositionParticipant = RaidParticipant & { hasCompositionSpot: boolean; assignedCompositionRole?: CompositionRole }

const COMPOSITION_ROLE_ORDER: CompositionRole[] = ['tank', 'healer', 'dps']

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

const isEligibleForComposition = (p: RaidParticipant) =>
    !['bench', 'declined'].includes(p.details?.status ?? 'declined')

const getParticipantScore = (p: RaidParticipant, participantScoreByCharacterKey: Map<string, RaidParticipantRrsScore>) =>
    participantScoreByCharacterKey.get(getCharacterKey(p))

const getParticipationCount = (p: RaidParticipant, participantScoreByCharacterKey: Map<string, RaidParticipantRrsScore>) =>
    getParticipantScore(p, participantScoreByCharacterKey)?.opportunitiesConsidered ?? 0

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

const isRaidCreator = (participant: RaidParticipant, createdById: number) =>
    participant.member.id === createdById


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
    createParticipantSpotComparator(participantScoreByCharacterKey)
)

const createParticipantSpotComparator = (participantScoreByCharacterKey: Map<string, RaidParticipantRrsScore>) => chainComparators<RaidParticipant>(
    compareAsc(getStatusRank),
    compareDesc(p => getIsGuildMember(p) ? 1 : 0),
    compareDesc(p => getRaidReadinessScore(p, participantScoreByCharacterKey)),
    compareDesc(p => getParticipationCount(p, participantScoreByCharacterKey)),
    compareAsc(p => getEnchantRank(p, participantScoreByCharacterKey)),
    compareAsc(getGuildRank),
    compareAsc(getCreatedAtTs)
)

const createCompositionRoleComparator = (participantScoreByCharacterKey: Map<string, RaidParticipantRrsScore>) => chainComparators<RaidParticipant>(
    compareAsc(getStatusRank),
    compareDesc(participant => getRaidReadinessScore(participant, participantScoreByCharacterKey)),
    createParticipantSpotComparator(participantScoreByCharacterKey)
)

const getParticipantCompositionRoles = (participant: RaidParticipant): CompositionRole[] => {
    const roles = participant.details?.role?.split('-') ?? []
    const compositionRoles: CompositionRole[] = []

    if (roles.includes('tank')) compositionRoles.push('tank')
    if (roles.includes('healer')) compositionRoles.push('healer')
    if (roles.includes('dps') || roles.includes('rdps')) compositionRoles.push('dps')

    return compositionRoles
}

const getCompositionSize = (composition: RaidComposition) => {
    if (!composition) return 0
    return (composition.raid_lead ?? 1) + (composition.tanks ?? 0) + (composition.healers ?? 0) + (composition.dps ?? 0)
}

export const sortParticipantsByComposition = (
    participants: RaidParticipant[],
    participantScoreByCharacterKey: Map<string, RaidParticipantRrsScore>,
    createdById: number,
    composition: RaidComposition
): AssignedCompositionParticipant[] => {
    const priorityComparator = createParticipantSpotComparator(participantScoreByCharacterKey)
    const compositionRoleComparator = createCompositionRoleComparator(participantScoreByCharacterKey)
    const sortedParticipants = [...participants].sort(priorityComparator)
    const compositionParticipants = sortedParticipants.filter(isEligibleForComposition)

    if (!composition) return sortedParticipants.map(participant => ({ ...participant, hasCompositionSpot: true }))

    const selectedIds = new Set<number>()
    const roleBuckets: Record<CompositionRole, AssignedCompositionParticipant[]> = {
        tank: [],
        healer: [],
        dps: [],
    }
    const extraRoster: AssignedCompositionParticipant[] = []
    const remainingRoleSlots: Record<CompositionRole, number> = {
        tank: composition.tanks ?? 0,
        healer: composition.healers ?? 0,
        dps: composition.dps ?? 0,
    }
    const raidLeadCount = Math.max(composition.raid_lead ?? 1, 1)
    const compositionSize = getCompositionSize(composition)
    const rrsComparator = chainComparators<RaidParticipant>(
        compareDesc(participant => getRaidReadinessScore(participant, participantScoreByCharacterKey)),
        priorityComparator
    )

    const findOpenParticipantRole = (participant: RaidParticipant) => {
        const participantRoles = getParticipantCompositionRoles(participant)
        return COMPOSITION_ROLE_ORDER.find(role => participantRoles.includes(role) && remainingRoleSlots[role] > 0)
    }

    const addParticipant = (participant: RaidParticipant, role?: CompositionRole, bucket?: AssignedCompositionParticipant[]) => {
        selectedIds.add(participant.member.character.id)
        if (role) remainingRoleSlots[role] = Math.max(remainingRoleSlots[role] - 1, 0)
        ;(bucket ?? extraRoster).push({ ...participant, hasCompositionSpot: true, assignedCompositionRole: role })
    }

    compositionParticipants
        .filter(participant => isRaidCreator(participant, createdById))
        .slice(0, raidLeadCount)
        .forEach(participant => {
            const role = findOpenParticipantRole(participant)
            addParticipant(participant, role, role ? roleBuckets[role] : extraRoster)
        })

    COMPOSITION_ROLE_ORDER.forEach((role) => {
        compositionParticipants
            .filter(participant => !selectedIds.has(participant.member.character.id))
            .filter(participant => {
                const roles = getParticipantCompositionRoles(participant)
                return roles.includes(role)
            })
            .sort(compositionRoleComparator)
            .forEach(participant => {
                if (remainingRoleSlots[role] <= 0) return
                addParticipant(participant, role, roleBuckets[role])
            })
    })

    COMPOSITION_ROLE_ORDER.forEach((role) => roleBuckets[role].sort(compositionRoleComparator))
    extraRoster.sort(rrsComparator)

    const roster = [...roleBuckets.tank, ...roleBuckets.healer, ...roleBuckets.dps, ...extraRoster]

    compositionParticipants
        .filter(participant => !selectedIds.has(participant.member.character.id))
        .sort(rrsComparator)
        .slice(0, Math.max(compositionSize - roster.length, 0))
        .forEach(participant => addParticipant(participant))

    const overflow = sortedParticipants
        .filter(participant => !selectedIds.has(participant.member.character.id))
        .sort(rrsComparator)
        .map(participant => ({ ...participant, hasCompositionSpot: false }))

    return [
        ...roleBuckets.tank,
        ...roleBuckets.healer,
        ...roleBuckets.dps,
        ...extraRoster,
        ...overflow,
    ]
}
