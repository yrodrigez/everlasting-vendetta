create or replace function achievement_raid_gnomish_vanguard(character_name text)
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
                 else count(*)*100.0
                end as progress
        from ev_raid_participant rp
                 join ev_member on ev_member.id = rp.member_id
        where raid_id = '38b9e363-7c7e-43b2-9e3b-10200946ddaa'
          and is_confirmed = true
          and ev_member.character->>'name' = character_name;
END;
$$;
