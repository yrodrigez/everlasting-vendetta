'use client';

import {Button} from "@/app/components/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare, faEye, faEyeSlash} from "@fortawesome/free-solid-svg-icons";
import {useRouter} from "next/navigation";
import {ChatControls} from "@/app/raid/[id]/chat/components/ChatControls";
import {ChatMessages} from "@/app/raid/[id]/chat/components/ChatMessages";
import {useSession} from "@hooks/useSession";
import {SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {useCallback, useEffect, useState} from "react";
import {useChatStore} from "@/app/raid/[id]/chat/components/chatStore";
import moment from "moment/moment";
import useScreenSize from "@hooks/useScreenSize";
import {useQuery} from "@tanstack/react-query";
import {useReactions} from "@/app/raid/[id]/chat/components/useReactions";

const tableFields = `*, character:ev_member(id,character)`;
const table = 'reset_messages';

function chatMessageMapper(message: any) {
    return {
        id: message.id,
        character: {
            id: message.character.id,
            name: message.character.character.name,
            avatar: message.character.character.avatar,
            className: message?.character?.character?.playable_class?.name ?? message?.character?.character?.character_class?.name ?? 'default',
        },

        // Oct 10 12:00
        created: moment(message.created_at).format('MMM D HH:mm'),
        content: message.content
    }
}

async function fetchMessages(supabase: SupabaseClient, resetId: string) {
    const {data, error} = await supabase
        .from(table)
        .select(tableFields)
        .eq('reset_id', resetId)
        .order('created_at', {ascending: true})
        .limit(100)

    if (error) {
        console.error(error)
        return []
    }

    return data.map(chatMessageMapper)
}


export function ChatContainer({resetId: id, showRedirect = false, raidName}: {
    resetId: string,
    showRedirect?: boolean,
    raidName?: string
}) {
    const router = useRouter()
    const {supabase, selectedCharacter} = useSession()
    const {messages, addMessage, setMessages} = useChatStore()
    const [shouldHide, setShouldHide] = useState(false)

    const {isDesktop} = useScreenSize()
    useEffect(() => {
        if (isDesktop) {
            setShouldHide(!isDesktop)
        }
    }, [isDesktop]);

    const {emojis = [], reactions = [], addReaction, removeReaction} = useReactions(id)
    useEffect(() => {
        if (!reactions?.length || !messages?.length) return

        const newMessages = messages.map(message => {
            // Find all reactions for this message
            const messageReactions = reactions.filter(
                reaction => reaction.message?.id === message.id
            );

            // Only update the message if its reactions have changed
            if (messageReactions?.length) {
                return {
                    ...message,
                    reactions: messageReactions,
                };
            } else {
                return {
                    ...message,
                    reactions: [],
                };
            }
        });
        setMessages(newMessages);
    }, [reactions, id, selectedCharacter, supabase]);

    useQuery({
        queryKey: ['chat', id],
        queryFn: async () => {
            if (!supabase) return []
            const messages = await fetchMessages(supabase, id)

            setMessages(messages.map(m => {
                const _reactions = reactions?.filter(r => r.message?.id === m.id) ?? []
                return {...m, reactions: _reactions}
            }))
            return messages
        },
        enabled: !!supabase
    })

    useEffect(() => {
        if (!supabase) return
        const channel = supabase.channel(`raid_chat:${id}`)
            .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: table,
                    filter: `reset_id=eq.${id}`
                },
                async (payload: any) => {
                    const messageId = parseInt(payload.new.id)
                    if (!messageId || isNaN(messageId)) return

                    if (messages.find(m => m.id === messageId)) {
                        return
                    }
                    const {data: message, error} = await supabase
                        .from(table)
                        .select(tableFields)
                        .eq('id', messageId)
                        .eq('reset_id', id)
                        .maybeSingle()

                    if (error) {
                        console.error(error)
                        return
                    }

                    if (!message) {
                        return
                    }

                    addMessage(chatMessageMapper(message))
                }
            ).subscribe()

        return () => {
            channel.unsubscribe().then(
                () => console.log('Unsubscribed from chat channel')
            )
        }
    }, [supabase, id, selectedCharacter])

    const insertMessage = useCallback((message: string) => {
        if (!supabase || !selectedCharacter) return
        if (!message?.trim()) return
        supabase.from(table).insert([
            {
                content: message.trim().replace(/([^\s\r\n]+)/gim, (_, $1) => {
                    const {emoji} = emojis.find(e => e.shortcut === $1) || {}
                    return emoji ? `${emoji}` : $1
                }),
                reset_id: id,
                character_id: selectedCharacter.id,
                created_at: new Date()
            }
        ]).select(tableFields).then(({data, error}) => {
            if (error) {
                console.error(error)
                alert(error.message)
                return
            }

            addMessage(chatMessageMapper(data[0]))
        })
    }, [supabase, id, selectedCharacter])

    if (!supabase) return null

    return (
        <div
            className={`w-full h-full flex flex-col gap-2 relative items-center grow transition-all ${showRedirect && !shouldHide ? 'max-h-40 lg:max-h-full bg-[rgba(66,59,53,.5)] rounded-xl border border-wood-100 p-1' : ''} ${showRedirect && shouldHide ? 'min-h-8' : ''}`}>
            {!shouldHide ? (
                <>
                    <ChatMessages messages={messages} addReaction={addReaction} emojis={emojis}
                                  removeReaction={removeReaction}/>
                    <div className="w-full h-12 flex flex-col gap-2 items-baseline justify-end">
                        <ChatControls showRedirect={showRedirect} onSubmit={insertMessage}/>
                    </div>
                </>
            ) : null}
            {showRedirect && (<div className="absolute top-0 right-0 opacity-20 hover:opacity-100 flex gap-2">
                <Button
                    isIconOnly
                    size="sm"
                    className="text-default bg-transparent lg:hidden"
                    variant="light"
                    onClick={() => {
                        setShouldHide(!shouldHide)
                    }}
                >
                    <FontAwesomeIcon icon={shouldHide ? faEye : faEyeSlash}/>
                </Button>
                <Button isIconOnly size="sm" className="text-default bg-transparent rounded-tr-xl" variant="light"
                        onClick={() => {
                            router.push(`/raid/${id}/chat`)
                        }}
                >
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare}/>
                </Button>
            </div>)}
        </div>
    )
}
