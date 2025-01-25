create or replace function achievement_raid_king(character_name text)
    returns TABLE
            (
                achieved boolean,
                progress numeric
            )
    language plpgsql
    set search_path to 'public'
as
$$
BEGIN
    RETURN QUERY
        with raids_created as (select count(rs.id) as count
                               from raid_resets rs
                                        join ev_member m on m.id = rs.created_by
                               where
                                   m.character ->> 'name' = character_name
                                 and  (select count(1)
                                       from ev_raid_participant rp
                                       where rp.raid_id = rs.id and rp.details ->> 'status' = 'confirmed') >= 10
                                 and (select count(1) from ev_loot_history lh where lh.raid_id = rs.id) >= 10
                                 and (select count(1) from raid_loot_reservation rlr where rlr.reset_id = rs.id) >= 10
                                 and coalesce(rs.status,'') != 'cancelled'
                                 and rs.end_date < current_date - interval '1 day')
        SELECT CASE
                   WHEN COALESCE(rc.count, 0) >= 100 THEN TRUE
                   ELSE FALSE
                   END                              AS has_two_alts_raided,
               CASE
                   WHEN COALESCE(rc.count, 0) >= 100 THEN 100.0
                   ELSE COALESCE(rc.count, 0.0) END AS progres
        FROM raids_created rc;
END;
$$;
