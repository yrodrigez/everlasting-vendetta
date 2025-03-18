create or replace function achievement_raid_scarlet_pioneers(character_name text)
    returns TABLE(achieved boolean, progress numeric)
    language plpgsql
    set search_path to 'public'
as
$$
BEGIN
    RETURN QUERY
        select
            case when count(*) >= 1 then true
                 else false
                end as achieved,
            case when count(*) >= 1 then 100.0
                 else 0.0
                end as progress
        from ev_raid_participant rp
                 join ev_member on ev_member.id = rp.member_id
                join raid_resets rr on rr.id = rp.raid_id
        where rp.raid_id = '5962902d-7137-4e16-9659-d4ed53acbee9'
          and is_confirmed = true
          and ev_member.character->>'name' = character_name
          and end_date < CURRENT_DATE - INTERVAL '1 day';
END;
$$;
