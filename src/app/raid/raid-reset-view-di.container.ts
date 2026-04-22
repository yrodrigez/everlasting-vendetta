import { SupabaseClient } from "@supabase/supabase-js";
import { RaidResetsViewRepository } from "./raid-resets-view.repository";
import { ReservationsRepository } from "./[id]/soft-reserv/reservations-repository";
import { RaidResetViewService } from "./raid-reset-view.service";
import { LootHistoryRepository } from "./loot-history.repository";

export class RaidResetViewDIContainer {
    private readonly raidResetsViewRepository: RaidResetsViewRepository;
    private readonly raidLootReservationsRepository: ReservationsRepository
    private readonly lootHistoryRepository: LootHistoryRepository;
    public readonly raidResetViewService: RaidResetViewService;
    constructor(supabase: SupabaseClient) {
        this.raidResetsViewRepository = new RaidResetsViewRepository(supabase);
        this.raidLootReservationsRepository = new ReservationsRepository(supabase);
        this.lootHistoryRepository = new LootHistoryRepository(supabase);
        this.raidResetViewService = new RaidResetViewService(this.raidResetsViewRepository, this.raidLootReservationsRepository, this.lootHistoryRepository);
    }
}