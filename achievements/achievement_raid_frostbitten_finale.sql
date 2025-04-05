drop function if exists achievement_raid_frostbitten_finale;
create or replace function achievement_raid_frostbitten_finale(character_name text)
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
        SELECT *
        from member_participated_reset(
                character_name,
                'db3e6702-b65a-4780-984c-e89f455628d6'::uuid
             );
END;
$$;