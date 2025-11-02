'use client'

import { Button } from "@/app/components/Button";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { useCharacterStore } from "@/app/components/characterStore";
import { useAuth } from "@/app/context/AuthContext";
import { createClientComponentClient } from "@/app/util/supabase/createClientComponentClient";

export default function ParticipateButton({ sound, children, eventId }: {
    sound: string,
    children: string,
    eventId?: number
}) {
    const { accessToken } = useAuth();
    const supabase = useMemo(() => createClientComponentClient(accessToken), [accessToken]);

    const selectedCharacter = useCharacterStore(useShallow(state => state.selectedCharacter));
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const participate = useCallback(() => {
        if (!selectedCharacter || !eventId || !supabase) return;
        setIsLoading(true);
        supabase.from('guild_events_participants').insert({
            event_id: eventId,
            member_id: selectedCharacter.id,
            position: selectedCharacter.name === 'Felsargon' ? 1 : 999,
        }).then(({ error }: { error?: any }) => {
            if (error) {
                console.error(error);
                toast.error('Failed to participate in event');
            } else {
                const audio = new Audio(sound);
                audio.load();
                audio.play();
            }
            setTimeout(() => {
                setIsLoading(false);
            }, 2000)
        })
    }, [supabase, selectedCharacter]);

    useEffect(() => {
        if (!supabase) return;

        const channel = supabase.channel(`guild_events_participants_channel`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'guild_events_participants',
            }, async () => {
                router.refresh()
            }).subscribe()
        return () => {
            supabase?.removeChannel(channel)
        }
    }, [supabase, router]);

    return (
        <Button
            isLoading={!selectedCharacter || !eventId || !supabase || isLoading}
            isDisabled={!selectedCharacter || !eventId || !supabase}
            onPress={() => participate()} className="text-gold">
            {children}
        </Button>
    )
}