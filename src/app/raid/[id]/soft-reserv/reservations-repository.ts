import { SupabaseClient } from "@supabase/supabase-js";
import { Character, RaidItem, Reservation } from "./types";
import { RAID_STATUS } from "../../components/utils";
import { Day } from "@/app/calendar/new/Components/useCreateRaidStore";

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
        const [hardReservations, databaseItems] = await Promise.all([
            this.getHardReservations(resetId),
            this.supabase.from('raid_loot')
                .select('item:raid_loot_item(*)')
                .eq('raid_id', raidId)
                .eq('is_visible', true)
                .overrideTypes<{ item: RaidItem }[]>()
        ])

        console.log('Fetched raid items from database:', databaseItems.data?.length);

        return (databaseItems.data ?? []).map(function (x) {
            return {
                ...x.item,
                isHardReserved: !!hardReservations?.some(r => r.item_id === x.item.id)
            }
        }).reduce(function (acc, item) {
            if (!acc.find(i => i.id === item.id)) {
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
}