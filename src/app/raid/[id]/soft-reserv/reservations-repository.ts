import { SupabaseClient } from "@supabase/supabase-js";
import { Character, LootHistoryEntry, RaidItem, RaidLootItemRule, Reservation, ReserveRule } from "./types";

import { Day } from "@/app/calendar/new/Components/useCreateRaidStore";
import { RAID_STATUS } from "@/app/raid/components/utils";

export class ReservationsRepository {
    constructor(private supabase: SupabaseClient) { }

    public async getHardReservations(resetId: string): Promise<{ item_id: number, item: any }[]> {
        const { data, error } = await this.supabase.from('reset_hard_reserve')
            .select('item_id, item:raid_loot_item(*)')
            .eq('reset_id', resetId)
            .overrideTypes<{ item_id: number, item: any }[]>()

        if (error) {
            console.error('Error fetching hard reservations:', error)
            return []
        }

        return data || []
    }

    public async getRaidItems(resetId: string, raidId: string): Promise<RaidItem[]> {
        const [hardReserveItemIds, ruleItemIds, databaseItems] = await Promise.all([
            this.fetchHardReserveItemIds(resetId),
            this.fetchItemIdsWithRules(resetId),
            this.supabase.from('raid_loot')
                .select(`
                    item:raid_loot_item!inner(
                        *,
                        bosses:bosses_items(
                            boss:bosses(*)
                        )
                    )
                `)
                .eq('raid_id', raidId)
                .eq('is_visible', true)
                .overrideTypes<any[]>()
        ])

        return (databaseItems.data ?? []).map(function (x) {
            return {
                ...x.item,
                boss: x.item.bosses?.[0]?.boss,
                isHardReserved: hardReserveItemIds.includes(x.item.id),
                hasRules: ruleItemIds.includes(x.item.id)
            }
        }).reduce(function (acc, item) {
            if (!acc.find((i: RaidItem) => i.id === item.id)) {
                acc.push(item)
            }
            return acc
        }, [] as RaidItem[])
    }

    public async isUserPresentInReservations(resetId: string, characterId: number): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('ev_raid_participant')
            .select('member_id')
            .eq('member_id', characterId)
            .eq('raid_id', resetId)
            .limit(1)

        console.log('isPresentFn query completed:', { data, error })

        if (error) {
            console.error('isPresentFn error:', error)
            return false
        }

        return !!data?.length
    }

    // TODO move to a reset repository
    public async getResetDays(resetId: string): Promise<Day[]> {
        try {
            const { data, error } = await this.supabase
                .from('raid_resets')
                .select('days')
                .eq('id', resetId)
                .limit(1)
                .maybeSingle()


            if (error) {
                console.error('fetchResetDays error:', error)
                return []
            }

            return data?.days ?? []
        } catch (err) {
            return []
        }
    }


    public groupByItem(reservations: Reservation[]) {
        // @ts-ignore
        return reservations.reduce((acc, reservation) => {
            if (!reservation.item) return acc
            const found = acc.find((i) => i.item.id === reservation.item.id)
            if (found) {
                found.reservations.push(reservation.member.character)
            } else {
                acc.push({
                    item: reservation.item,
                    reservations: [reservation.member.character]
                })
            }
            return acc
        }, [] as { item: RaidItem, reservations: Character[] }[])
    }

    public async fetchReservedItems(raidId: string): Promise<Reservation[]> {
        const { data, error } = await this.supabase
            .from('raid_loot_reservation')
            .select('id, item_id, item:raid_loot_item(*), reset:raid_resets(id, raid_date, name, min_lvl, image_url, time, end_date, reservations_closed), member:ev_member(id, character)')
            .eq('reset_id', raidId)
            .neq('status', RAID_STATUS.BENCH)
            .overrideTypes<Reservation[]>()

        if (error) {
            console.error(error)
            return []
        }

        return data || []
    }

    public async reserveItem(raidId: string, itemId: number, characterId: number): Promise<{ isError: boolean, id?: string }> {
        const { error, data } = await this.supabase
            .from('raid_loot_reservation')
            .insert({
                reset_id: raidId,
                item_id: itemId,
                member_id: characterId
            })
            .select('id')
            .maybeSingle()
            .overrideTypes<{ id: string }>()

        if (error) {
            console.error(error)
        }

        return { isError: !!error, id: data?.id }
    }

    public async removeReservation(raidId: string, itemId: number, characterId: number): Promise<void> {
        const { error } = await this.supabase
            .from('raid_loot_reservation')
            .delete()
            .eq('reset_id', raidId)
            .eq('item_id', itemId)
            .eq('member_id', characterId)
            .order('created_at', { ascending: false })
            .limit(1)
        if (error) {
            console.error(error)
        }
    }

    public async removeAllReservationsForCharacter(raidId: string, characterId: number): Promise<boolean> {
        const { error } = await this.supabase
            .from('raid_loot_reservation')
            .delete()
            .eq('reset_id', raidId)
            .eq('member_id', characterId)

        if (error) {
            console.error(error)
            return false
        }

        return true
    }


    public async removeReservationById(reservationId: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('raid_loot_reservation')
            .delete()
            .eq('id', reservationId)

        if (error) {
            console.error(error)
            return false
        }

        return true
    }

    public async hardReserveItem(resetId: string, itemId: number,): Promise<boolean> {
        const { error } = await this.supabase.from('reset_hard_reserve').insert({
            reset_id: resetId,
            item_id: itemId,
        })

        if (error) {
            console.error(error)
            return false
        }

        return true
    }

    public async removeHardReserveByResetIdAndItemId(resetId: string, itemId: number): Promise<boolean> {
        const { error } = await this.supabase.from('reset_hard_reserve').delete().eq('reset_id', resetId).eq('item_id', itemId)

        if (error) {
            console.error(error)
            return false
        }

        return true
    }

    public async removeReservationsByItemAndResetId(itemId: number, resetId: string): Promise<boolean> {
        const { error } = await this.supabase.from('raid_loot_reservation').delete().eq('reset_id', resetId).eq('item_id', itemId)

        if (error) {
            console.error(error)
            return false
        }

        return true
    }

    public async toggleReservationOpen(raidId: string, isOpen: boolean): Promise<boolean> {
        const { error, data } = await this.supabase
            .from('raid_resets')
            .update({ reservations_closed: isOpen })
            .eq('id', raidId)
            .select('reservations_closed')
            .single()

        if (error) {
            console.error(error)
            return false
        }

        return !data?.reservations_closed
    }

    public async getReserveOpenStatus(raidId: string,): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('raid_resets')
            .select('reservations_closed')
            .eq('id', raidId)
            .single()

        if (error) {
            console.error(error)
            return false
        }

        return !data?.reservations_closed
    }

    public async fetchMaxReservations(resetId: string, characterId: number): Promise<number> {
        const { data, error } = await this.supabase
            .rpc('calculate_total_reservations', {
                reset_uuid: resetId,
                char_id: characterId
            });

        if (error) {
            console.error(error)
            return 0
        }

        return data ?? 0
    }

    public async fetchLootHistoryByItemId(itemId: number): Promise<LootHistoryEntry[]> {
        const { data, error } = await this.supabase
            .from('ev_loot_history')
            .select('id, character, dateTime, offspec, raid_id')
            .eq('itemID', itemId)
            .order('dateTime', { ascending: false })
            .limit(50)
            .overrideTypes<LootHistoryEntry[]>()

        if (error) {
            console.error('Error fetching loot history for item:', error)
            return []
        }

        return data || []
    }

    public async fetchReserveRules(): Promise<ReserveRule[]> {
        const { data, error } = await this.supabase
            .from('reserve_rules')
            .select('*')
            .overrideTypes<ReserveRule[]>()

        if (error) {
            console.error('Error fetching reserve rules:', error)
            return []
        }

        return data || []
    }

    public async fetchItemRules(resetId: string, itemId: number): Promise<RaidLootItemRule[]> {
        const { data, error } = await this.supabase
            .from('raid_loot_item_rules')
            .select('*, rule:reserve_rules(*)')
            .eq('reset_id', resetId)
            .eq('item_id', itemId)
            .overrideTypes<RaidLootItemRule[]>()

        if (error) {
            console.error('Error fetching item rules:', error)
            return []
        }

        return data || []
    }

    public async addItemRule(resetId: string, itemId: number, ruleId: number, value: Record<string, any>, userId: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('raid_loot_item_rules')
            .insert({
                reset_id: resetId,
                item_id: itemId,
                rule_id: ruleId,
                value,
                created_by: userId
            })

        if (error) {
            console.error('Error adding item rule:', error)
            return false
        }

        return true
    }

    public async removeItemRule(ruleEntryId: number): Promise<boolean> {
        const { error } = await this.supabase
            .from('raid_loot_item_rules')
            .delete()
            .eq('id', ruleEntryId)

        if (error) {
            console.error('Error removing item rule:', error)
            return false
        }

        return true
    }

    public async fetchHardReserveRules(resetId: string): Promise<{ id: number, item_id: number, item: any }[]> {
        const { data, error } = await this.supabase
            .from('raid_loot_item_rules')
            .select('id, item_id, item:raid_loot_item(*), rule:reserve_rules!inner(type)')
            .eq('reset_id', resetId)
            .eq('rule.type', 'hard_reserve')
            .overrideTypes<{ id: number, item_id: number, item: any }[]>()

        if (error) {
            console.error('Error fetching hard reserve rules:', error)
            return []
        }

        return data || []
    }

    public async fetchHardReserveItemIds(resetId: string): Promise<number[]> {
        const rules = await this.fetchHardReserveRules(resetId)
        return rules.map(r => r.item_id)
    }

    public async fetchItemIdsWithRules(resetId: string): Promise<number[]> {
        const { data, error } = await this.supabase
            .from('raid_loot_item_rules')
            .select('item_id')
            .eq('reset_id', resetId)

        if (error) {
            console.error('Error fetching item IDs with rules:', error)
            return []
        }

        return Array.from(new Set((data || []).map(r => r.item_id)))
    }

    public async fetchAllRulesForReset(resetId: string): Promise<RaidLootItemRule[]> {
        const { data, error } = await this.supabase
            .from('raid_loot_item_rules')
            .select('*, rule:reserve_rules(*), item:raid_loot_item(*)')
            .eq('reset_id', resetId)
            .overrideTypes<(RaidLootItemRule & { item: any })[]>()

        if (error) {
            console.error('Error fetching all rules for reset:', error)
            return []
        }

        return data || []
    }

    public async cloneRulesFromReset(sourceResetId: string, targetResetId: string, userId: string): Promise<boolean> {
        const { data: sourceRules, error: fetchError } = await this.supabase
            .from('raid_loot_item_rules')
            .select('item_id, rule_id, value')
            .eq('reset_id', sourceResetId)

        if (fetchError || !sourceRules?.length) {
            console.error('Error fetching source rules:', fetchError)
            return false
        }

        const { error: insertError } = await this.supabase
            .from('raid_loot_item_rules')
            .upsert(
                sourceRules.map(r => ({
                    ...r,
                    reset_id: targetResetId,
                    created_by: userId
                })),
                { onConflict: 'reset_id, item_id, rule_id' }
            )

        if (insertError) {
            console.error('Error cloning rules:', insertError)
            return false
        }

        return true
    }

    public async fetchPreviousResets(raidId: string, currentResetId: string, currentResetDate: string): Promise<{ id: string, raid_date: string, name: string }[]> {
        const { data, error } = await this.supabase
            .from('raid_resets')
            .select('id, raid_date, raid:ev_raid(name)')
            .eq('raid_id', raidId)
            .neq('id', currentResetId)
            .lt('raid_date', currentResetDate)
            .order('raid_date', { ascending: false })
            .limit(10)
            .overrideTypes<{ id: string, raid_date: string, raid: { name: string } }[]>()

        if (error) {
            console.error('Error fetching previous resets:', error)
            return []
        }

        return (data || []).map(d => ({ id: d.id, raid_date: d.raid_date, name: d.raid?.name || '' }))
    }
}