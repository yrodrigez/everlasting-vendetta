import {type SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useSession} from "@hooks/useSession";
import {useEffect} from "react";

const REACTION_TABLE = 'reaction';
const REACTION_TABLE_SELECT = `*`;
export type Reaction = {
    id: number;
    description: string;
    shortcut: string;
    emoji: string;
}

const MESSAGE_REACTIONS_TABLE = 'message_reaction';
const MESSAGE_REACTIONS_TABLE_SELECT = `*, character:ev_member(id,character), message:reset_messages(id), reaction:reactions(*)`;
export type MessageReaction = {
    id: number;
    character: {
        id: string;
        character: {
            name: string;
            avatar: string;
        };
    };
    message: {
        id: number;
    };
    reaction: {
        id: string;
        name: string;
    };
    created_at: string;
}


async function fetchReactions(supabase: SupabaseClient) {
    const {data, error} = await supabase
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
    const {data, error} = await supabase
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

async function fetchReaction(supabase: SupabaseClient, id?: string) {
    if (!id) return null
    const {data, error} = await supabase
        .from(REACTION_TABLE)
        .select(REACTION_TABLE_SELECT)
        .eq('id', id)
        .maybeSingle<MessageReaction>()


    if (error) {
        console.error(error)
        return null
    }

    return data
}

export function useReactions(resetId: string) {
    const {supabase, selectedCharacter} = useSession()
    const {data: emojis} = useQuery({
        queryKey: ['reactions'],
        queryFn: () => {
            if (!supabase) {
                return []
            }
            return fetchReactions(supabase)
        },
        enabled: !!supabase,
        staleTime: 1000 * 60 * 60 // 1 hour
    })

    const {data: reactions} = useQuery({
        queryKey: ['messageReactions', resetId],
        queryFn: () => {
            if (!supabase) {
                return []
            }
            return fetchMessageReactions(supabase, resetId)
        },
        initialData: [],
        enabled: !!supabase,
    })

    const queryClient = useQueryClient();
    useEffect(() => {
        if (!supabase) return;

        const channel = supabase.channel(`raid_chat:${resetId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: MESSAGE_REACTIONS_TABLE,
                filter: `message.reset_id=eq.${resetId}`
            }, async (payload) => {
                switch (payload.eventType) {
                    case 'INSERT':
                    case 'UPDATE': {
                        const newReaction = await fetchReaction(supabase, payload.new?.id);
                        if (!newReaction) return;

                        queryClient.setQueryData(['messageReactions', resetId], (oldData: MessageReaction[] = []) => {
                            const reactionIndex = oldData.findIndex((reaction) => reaction.id === newReaction.id);
                            if (reactionIndex >= 0) {
                                // Update existing reaction
                                return oldData.map((reaction, index) =>
                                    index === reactionIndex ? newReaction : reaction
                                );
                            } else {
                                // Insert new reaction
                                return [...oldData, newReaction];
                            }
                        });
                        break;
                    }
                    case 'DELETE': {
                        queryClient.setQueryData(['messageReactions', resetId], (oldData: MessageReaction[] = []) => {
                            return oldData.filter((reaction) => reaction.id !== payload.old?.id);
                        });
                        break;
                    }
                    default:
                        break;
                }
            }).subscribe();

        return () => {
            supabase.removeChannel(channel).then(() => console.log('Unsubscribed from reactions channel'));
        };
    }, [resetId, queryClient, supabase]);

    const addReaction = async (messageId: string, reactionId: string) => {
        if (!supabase || !selectedCharacter) return;
        await supabase.from(MESSAGE_REACTIONS_TABLE).upsert({
            message_id: messageId,
            reaction_id: reactionId,
            member_id: selectedCharacter.id,
        }, {
            onConflict: 'message_id,member_id',
            ignoreDuplicates: true
        });
    }

    return {
        emojis,
        reactions,
        addReaction
    }
}
