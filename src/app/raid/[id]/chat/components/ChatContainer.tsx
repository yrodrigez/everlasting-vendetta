'use client';
import {Input} from "@nextui-org/react";
import {Button} from "@/app/components/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare, faPaperPlane} from "@fortawesome/free-solid-svg-icons";
import {useRouter} from "next/navigation";
import {ChatControls} from "@/app/raid/[id]/chat/components/ChatControls";
import {ChatMessages} from "@/app/raid/[id]/chat/components/ChatMessages";
import {useSession} from "@hooks/useSession";
import {SupabaseClient} from "@supabase/auth-helpers-nextjs";
import {useCallback, useEffect} from "react";
import {useChatStore} from "@/app/raid/[id]/chat/components/chatStore";
import moment from "moment/moment";
import useScreenSize from "@hooks/useScreenSize";

const tableFields = `*, character:ev_member(id,character)`;
const table = 'reset_messages';

function chatMessageMapper(message: any) {
    return {
        id: message.id,
        character: {
            id: message.character.id,
            name: message.character.character.name,
            avatar: message.character.character.avatar
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


export function ChatContainer({resetId: id, showRedirect = false}: { resetId: string, showRedirect?: boolean }) {
    const router = useRouter()
    const {supabase, selectedCharacter} = useSession()
    const {messages, addMessage, setMessages} = useChatStore()

    const {isDesktop} = useScreenSize()

    useEffect(() => {
        if (!supabase) return
        fetchMessages(supabase, id).then((data) => {
            setMessages(data)
        })

        const channel = supabase.channel(`raid_chat:${id}`)
            .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: table,
                    filter: `reset_id=eq.${id}`
                },
                async (payload: any) => {
                    const messageId = parseInt(payload.new.id)
                    if(!messageId || isNaN(messageId)) return

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
        supabase.from(table).insert([
            {
                content: message,
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

    if (!isDesktop && showRedirect) {
        return null
    }

    if (!supabase) return <div>
        Loading...
    </div>

    if (!selectedCharacter) return <div>
        Select a character
    </div>

    return (
        <div className={`w-full h-full flex flex-col gap-2 relative ${showRedirect ? '' : 'px-14'} `}>
            <ChatMessages messages={messages}/>
            <div className="w-full h-12 flex flex-col gap-2 items-baseline justify-end">
                <ChatControls showRedirect={showRedirect} onSubmit={insertMessage}/>
            </div>
            {showRedirect && <div className="absolute top-0 right-0 opacity-20 hover:opacity-100">
              <Button isIconOnly size="sm" className="text-default bg-transparent" variant="light"
                      onClick={() => {
                          router.push(`/raid/${id}/chat`)
                      }}
              >
                <FontAwesomeIcon icon={faArrowUpRightFromSquare}/>
              </Button>
            </div>
            }
        </div>
    )
}
