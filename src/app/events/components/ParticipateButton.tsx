'use client'

import {Button} from "@/app/components/Button";
import {useSession} from "@hooks/useSession";
import {useCallback, useEffect, useState} from "react";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

export default function ParticipateButton({sound, children, eventId}: {
    sound: string,
    children: string,
    eventId?: number
}) {
    const {supabase, selectedCharacter} = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const participate = useCallback(() => {
        if (!selectedCharacter || !eventId || !supabase) return;
        setIsLoading(true);
        supabase.from('guild_events_participants').insert({
            event_id: eventId,
            member_id: selectedCharacter.id,
            position: selectedCharacter.name === 'Felsargon' ? 1 : 999,
        }).then(({error}) => {
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