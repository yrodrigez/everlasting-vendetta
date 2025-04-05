create or replace function member_participated_reset(
    member_name text,
    reset_id uuid
) returns TABLE (
    achieved boolean,
    progress numeric
    )
language plpgsql
set search_path to 'public'
as
$$
BEGIN
    RETURN QUERY
        with raids_participated as (select count(1) as count
                                     from ev_raid_participant rp
                                              join ev_member m on m.id = rp.member_id
                                     where
                                         m.character ->> 'name' = member_name
                                      and rp.raid_id = reset_id
                                      and rp.details ->> 'status' = 'confirmed')
        SELECT CASE
                   WHEN COALESCE(rc.count, 0) >= 1 THEN TRUE
                   ELSE FALSE
                   END                              AS achieved,
               CASE
                   WHEN COALESCE(rc.count, 0) >= 1 THEN 100.0
                   ELSE COALESCE(rc.count, 0.0) END AS progress
        FROM raids_participated rc;
END;
$$;


