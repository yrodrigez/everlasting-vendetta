import { type SupabaseClient } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useCharacterStore } from "@/app/components/characterStore";
import { useShallow } from "zustand/react/shallow";

const REACTION_TABLE = 'reaction';
const REACTION_TABLE_SELECT = `*`;
export type Reaction = {
    id: number;
    description: string;
    shortcut: string;
    emoji: string;
}

const MESSAGE_REACTIONS_TABLE = 'message_reaction';
const MESSAGE_REACTIONS_TABLE_SELECT = `*, character:ev_member(id,character), message:reset_messages(id), reaction:reaction(*)`;
export type MessageReaction = {
    id: number;
    character: {
        id: number;
        character: {
            name: string;
            avatar: string;
        };
    };
    message: {
        id: number;
    };
    reaction: Reaction;
    created_at: string;
}


async function fetchReactions(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from(REACTION_TABLE)
        .select(REACTION_TABLE_SELECT)
        .limit(100)
        .returns<Reaction[]>()

    if (error) {
        console.error(error)
        return []
    }

    return data as Reaction[]
}

async function fetchMessageReactions(supabase: SupabaseClient, resetId: string) {
    const { data, error } = await supabase
        .from(MESSAGE_REACTIONS_TABLE)
        .select(MESSAGE_REACTIONS_TABLE_SELECT)
        .eq('message.reset_id', resetId)
        .returns<MessageReaction[]>()

    if (error) {
        console.error(error)
        return []
    }

    return (data ?? []) as MessageReaction[]
}

async function fetchReaction(supabase: SupabaseClient, id?: string, resetId?: string) {
    if (!id) return null
    const { data, error } = await supabase
        .from(MESSAGE_REACTIONS_TABLE)
        .select(MESSAGE_REACTIONS_TABLE_SELECT)
        .eq('id', id)
        .eq('message.reset_id', resetId)
        .maybeSingle<MessageReaction>()


    if (error) {
        console.error(error)
        return null
    }

    return data
}

function insertOrUpdateReaction(oldData: MessageReaction[], newReaction: MessageReaction) {
    const reactionIndex = oldData.findIndex((reaction) => reaction.id === newReaction.id);
    if (reactionIndex >= 0) {
        // Update existing reaction
        const newData = [...oldData];
        newData[reactionIndex] = newReaction;
        return newData;
    } else {
        // Insert new reaction
        return [...oldData, newReaction];
    }
}

export function useReactions(resetId: string, supabase: SupabaseClient | null) {
    const { selectedCharacter } = useCharacterStore(useShallow(state => ({
        selectedCharacter: state.selectedCharacter
    })))

    const [reactions, setReactions] = useState<MessageReaction[]>([])

    const { data: emojis, refetch: refetchEmojis } = useQuery({
        queryKey: ['reactions'],
        queryFn: () => {
            if (!supabase) {
                return []
            }
            return fetchReactions(supabase)
        },
        enabled: !!supabase,
        //staleTime: 1000 * 60 * 60 // 1 hour
    })
    const reactionsQueryKey = useMemo(() => ['messageReactions', { resetId }], [resetId])
    const { refetch } = useQuery({
        queryKey: reactionsQueryKey,
        queryFn: async () => {
            if (!supabase) {
                return []
            }

            const _reactions = await fetchMessageReactions(supabase, resetId)
            setReactions(_reactions)
            return _reactions
        },
        enabled: !!supabase,
    })

    const queryClient = useQueryClient();
    useEffect(() => {
        if (!supabase) return;

        refetchEmojis();
        refetch();
        const channel = supabase.channel(`message_reactions:${resetId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: MESSAGE_REACTIONS_TABLE,
                //filter: `message.reset_id=eq.${resetId}`
            }, async (payload) => {

                switch (payload.eventType) {
                    case 'INSERT':
                    case 'UPDATE': {
                        const newReaction = await fetchReaction(supabase, payload.new?.id, resetId);
                        if (!newReaction) return;
                        setReactions((oldData: MessageReaction[]) => {
                            if (!oldData) return [];
                            return insertOrUpdateReaction(oldData, newReaction);
                        });
                        break;
                    }
                    case 'DELETE': {

                        setReactions((oldData: MessageReaction[]) => {
                            if (!oldData) return [];
                            return oldData.filter((reaction) => reaction.id !== payload.old?.id);
                        });
                        break;
                    }
                    default:
                        break;
                }
            }).subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [resetId, queryClient, supabase]);


    const { mutate: addReaction } = useMutation({
        mutationKey: ['addReaction'],
        mutationFn: async ({ messageId, reactionId }: { messageId: number, reactionId: number }) => {
            if (!supabase || !selectedCharacter) return;

            const { data: newReaction, error } = await supabase.from(MESSAGE_REACTIONS_TABLE).upsert({
                message_id: messageId,
                reaction_id: reactionId,
                member_id: selectedCharacter.id,
            }, {
                onConflict: 'message_id, member_id',
            }).select(MESSAGE_REACTIONS_TABLE_SELECT).single<MessageReaction>();

            if (error) {
                throw new Error('Error adding reaction' + JSON.stringify(error));
            }
            return newReaction;
        },
        onSuccess: (newReaction) => {
            if (!newReaction) return;

            setReactions((oldData: MessageReaction[]) => {
                if (!oldData) return [];
                return insertOrUpdateReaction(oldData, newReaction);
            });
        }
    })

    const { mutate: removeReaction } = useMutation({
        mutationKey: ['removeReaction'],
        mutationFn: async ({ messageId }: { messageId: number }) => {
            if (!supabase || !selectedCharacter) return;

            const { data: deletedReaction, error } = await supabase.from(MESSAGE_REACTIONS_TABLE).delete()
                .eq('message_id', messageId)
                .eq('member_id', selectedCharacter.id)
                .select(MESSAGE_REACTIONS_TABLE_SELECT).maybeSingle<MessageReaction>();

            if (error) {
                console.error('Error removing reaction', error);
                throw new Error('Error removing reaction' + JSON.stringify(error));
            }

            return deletedReaction;
        },
        onSuccess: (deletedReaction) => {
            if (!deletedReaction) return;

            setReactions((oldData: MessageReaction[]) => {
                if (!oldData) return [];
                return [...oldData.filter((reaction) => reaction.id !== deletedReaction.id)];
            });
        }
    })


    return {
        emojis,
        reactions,
        addReaction,
        removeReaction
    }
}
