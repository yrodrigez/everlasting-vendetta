import { ReservationsRepository } from "./[id]/soft-reserv/reservations-repository";
import { LootHistoryRepository } from "./loot-history.repository";
import { RaidResetsViewRepository } from "./raid-resets-view.repository";

export class RaidResetViewService {
    constructor(
        private readonly raidResetsViewRepository: RaidResetsViewRepository,
        private readonly raidLootReservationsRepository: ReservationsRepository,
        private readonly lootHistoryRepository: LootHistoryRepository,
    ) { }

    async hasResetLootHistory(raidResetId: string) {
        return this.lootHistoryRepository.hasResetLootHistory(raidResetId)
    }

    async hasCharacterReservations(raidResetId: string, characterId: number | undefined) {
        if (!characterId) return false
        return this.raidLootReservationsRepository.memberHasReservations(raidResetId, characterId)
    }

    async findResetsCurrentResetsFromSameRaid(raid_id: string, reset_id: string) {

        return this.raidResetsViewRepository.findResetsCurrentResetsFromSameRaid(raid_id, reset_id)
    }

    async getResetByResetId(resetId: 'current' | 'next' | string) {

        if (resetId === 'current') {
            return this.findCurrent();
        }

        if (resetId === 'next') {
            return this.findNext();
        }

        return this.findById(resetId);
    }

    async findNext() {
        const { data: nextRaidReset, error } = await this.raidResetsViewRepository.findNext()

        if (error) {
            return { error }
        }

        if (!nextRaidReset) {
            return { error: new Error('No upcoming raid reset found') }
        }

        return { data: nextRaidReset, error: null }
    }

    async findCurrent() {
        const { data: currentRaidReset, error } = await this.raidResetsViewRepository.findCurrent()

        if (error) {
            return { error }
        }

        if (!currentRaidReset) {
            return { error: new Error('No current raid reset found') }
        }

        return { data: currentRaidReset, error: null }
    }

    async findById(id: string) {
        const { data: raidReset, error } = await this.raidResetsViewRepository.findById(id)

        if (error) {
            return { error }
        }

        if (!raidReset) {
            return { error: new Error('No raid reset found with id ' + id) }
        }

        return { data: raidReset, error: null }
    }

    async findPreviousAndNext(raid_date: string) {
        const [previous, next] = await this.raidResetsViewRepository.findPreviousAndNext(raid_date)
        return { previous, next }
    }
}