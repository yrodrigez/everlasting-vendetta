export const raidLootReservationsColumns = //table  -> raid_loot_reservation
    'id, item_id, item:raid_loot_item(*), reset:raid_resets(id, raid_date, name, min_lvl, image_url, time, end_date, reservations_closed), member:ev_member(id, character)';
