create or replace function achievement_raid_jungle_trailblazer(character_name text)
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
    return query
    with first_reset_of as (select rr.id as reset_id
                            from raid_resets rr
                                     join ev_raid_participant rp on rr.id = rp.raid_id
                                     join ev_member m on m.id = rp.member_id
                                     join ev_raid r on r.id = rr.raid_id
                                     join ev_loot_history lh on lh.raid_id = rr.id
                            where r.name = 'Zul''Gurub'
                            order by rr.raid_date, rr.time
                            limit 1),
         is_participant as (select m.character ->> 'name' as name
                            from ev_raid_participant rp
                                     join ev_member m on m.id = rp.member_id
                            where rp.raid_id = (select reset_id from first_reset_of)
                              and rp.details ->> 'status' = 'confirmed')
    select case
               when count(*) >= 1 then true
               else false
               end as achieved,
           case
               when count(*) >= 1 then 100.0
               else count(*) * 100.0
               end as progress
    from is_participant
    where name = character_name;
END;
$$;
