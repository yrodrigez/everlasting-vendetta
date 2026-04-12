'use client'

import { Autocomplete, AutocompleteItem } from "@/components/autocomplete";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";
import useCreateRaidStore from "@/app/calendar/new/Components/useCreateRaidStore";
import { useSupabase } from "@/context/SupabaseContext";
import { useCharacterStore } from "@/components/characterStore";
import { GUILD_NAME } from "@/util/constants";

type Member = {
    id: number;
    name: string;
    className?: string;
    level?: number;
}

export function CreatedBySelector() {
    const supabase = useSupabase();
    const { realm, raid, createdById, setCreatedById } = useCreateRaidStore(useShallow(state => ({
        realm: state.realm,
        raid: state.raid,
        createdById: state.createdById,
        setCreatedById: state.setCreatedById,
    })));
    const currentCharacter = useCharacterStore(state => state.selectedCharacter);

    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const seededRef = useRef(false);

    const minLevel = raid?.min_level ?? 1;

    useEffect(() => {
        if (!supabase || !realm || !raid) {
            setMembers([]);
            return;
        }
        let cancelled = false;
        setLoading(true);
        supabase.from('ev_member')
            .select('id, character')
            .filter('character->guild->>name', 'eq', GUILD_NAME)
            .filter('character->realm->>slug', 'eq', realm)
            .filter('character->>level', 'gte', minLevel)
            .order('character->>name')
            .then(({ data, error }) => {
                if (cancelled) return;
                setLoading(false);
                if (error) {
                    console.error('Error loading guild members', error);
                    setMembers([]);
                    return;
                }
                const mapped: Member[] = (data ?? [])
                    .map((row: any) => ({
                        id: row.id,
                        name: row.character?.name ?? 'Unknown',
                        className: row.character?.playable_class?.name,
                        level: row.character?.level,
                    }))
                    .filter(m => typeof m.id === 'number');
                setMembers(mapped);
            });
        return () => { cancelled = true; };
    }, [supabase, realm, minLevel, raid]);

    useEffect(() => {
        if (members.length === 0) return;
        const storeId = useCreateRaidStore.getState().createdById;
        if (storeId !== undefined) {
            if (!members.some(m => m.id === storeId)) {
                setCreatedById(undefined);
                seededRef.current = true;
                return;
            }
            seededRef.current = true;
            return;
        }
        if (seededRef.current) return;
        if (currentCharacter && members.some(m => m.id === currentCharacter.id)) {
            setCreatedById(currentCharacter.id);
        }
        seededRef.current = true;
    }, [members, currentCharacter, setCreatedById]);

    const isDisabled = !raid;

    return (
        <Autocomplete
            label="Created By"
            placeholder={isDisabled ? "Select a raid first" : "Search a character"}
            className="max-w-[400px]"
            radius="md"
            isDisabled={isDisabled}
            isLoading={loading}
            defaultItems={members}
            selectedKey={createdById !== undefined ? String(createdById) : null}
            onSelectionChange={(key) => {
                if (key === null || key === undefined) {
                    setCreatedById(undefined);
                    return;
                }
                setCreatedById(Number(key));
            }}
        >
            {(member) => (
                <AutocompleteItem key={String(member.id)} textValue={member.name}>
                    {member.name}{member.className ? ` — ${member.className}` : ''}
                </AutocompleteItem>
            )}
        </Autocomplete>
    );
}
