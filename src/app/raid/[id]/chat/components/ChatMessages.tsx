import {type ChatMessage} from "./chatStore";
import {ReactNode, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useSessionStore} from "@hooks/useSessionStore";
import Link from "next/link";
import {useQuery} from "@tanstack/react-query";
import {Button, Popover, PopoverContent, PopoverTrigger, Spinner, Tooltip, useDisclosure} from "@heroui/react";

import {ChevronDown, ChevronUp, SmilePlus} from "lucide-react";
import {MessageReaction, Reaction} from "@/app/raid/[id]/chat/components/useReactions";

const isCharacterAvailable = async (name: string) => {
    if (!name) return false
    const response = await fetch(`/api/v1/services/wow/getCharacterByName?name=${encodeURIComponent(name.toLowerCase())}&temporal=true`)
    return response.ok
}

const CharacterMention = ({name}: { name: string }) => {
    const capitalize = useCallback((str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }, [name]);

    const {data: isAvailable, isLoading} = useQuery({
        queryKey: ['character', name],
        queryFn: async () => {
            return await isCharacterAvailable(name)
        },
        refetchOnWindowFocus: false,
        staleTime: Infinity
    })

    return isLoading ?
        <div className="inline-flex items-baseline text-gray-500 whitespace-nowrap">
            <Spinner size="sm"
                     color="current"/>{capitalize(name)}
        </div> : isAvailable ? (
            <Link href={`/roster/${encodeURIComponent(name.toLowerCase())}`} target="_blank" className="text-blue-500">
                @{capitalize(name)}
            </Link>
        ) : (<span>@{name}</span>)
}

const extractYouTubeID = (url: string) => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(youtubeRegex);
    return match ? match[1] : null;
};

const UrlLink = ({href}: { href: string }) => {
    const isYouTubeLink = extractYouTubeID(href);
    const {data: linkMetadata} = useQuery({
        queryKey: ['link', href],
        queryFn: async () => {
            const response = await fetch(`/api/v1/services/link/preview?url=${encodeURIComponent(href)}`)
            return response.ok ? await response.json() : {} as {
                "title": string,
                "description": string,
                "image": string,
                "url": string
            }

        },
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !isYouTubeLink
    })

    if (isYouTubeLink) {
        return (
            <div className="youtube-embed flex justify-center items-center">
                <iframe
                    src={`https://www.youtube.com/embed/${isYouTubeLink}`}
                    title="YouTube video player"
                    className="w-full max-w-lg aspect-video rounded-xl border border-blue-500"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        );
    }

    return linkMetadata?.title ? (
            <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
            >
                {linkMetadata.title}
                {linkMetadata.image && (
                    <div className="flex w-full items-center justify-center">
                        <img src={linkMetadata.image} alt={linkMetadata.title}
                             className="max-w-52 max-h-32 rounded-xl border-blue-500 border"/>
                    </div>
                )}
            </Link>
        ) :
        (
            <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
            >
                {href}
            </Link>
        )
}

const ImageLink = ({src}: { src: string }) => {
    return (
        <Link href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500">
            <div className="flex w-full items-center justify-center">
                <img src={src} alt="image" className="max-w-52 max-h-32 rounded-xl border-blue-500 border"/>
            </div>
        </Link>
    )
}

const ChatMessageContent = ({
                                children
                            }: {
    children: string | ReactNode
}) => {
    if (typeof children !== 'string') return <div className="break-all">{children}</div>;

    const findURLs = useCallback(
        (text: string) => {
            const urlPattern = /(https?:\/\/\S+)/g;
            return text.split(urlPattern).map((part: string, i: number) => {

                if (part.match(/\.(jpeg|jpg|gif|png)$/) && part.match(urlPattern)) {
                    return (
                        <ImageLink
                            key={`image-${i}`}
                            src={part}
                        />
                    );
                }

                if (part.match(urlPattern)) {
                    return (
                        <UrlLink
                            key={`url-${i}`}
                            href={part}
                        />
                    );
                }

                return part;
            });
        },
        [children]
    );

    const findAtMentions = useCallback(
        (content: ReactNode[]) => {
            const atMentionsPattern = /@(\w+)/g;

            return content.flatMap((item, i) => {
                if (typeof item !== 'string') return item;

                return item.split(' ').map((part: string, j: number) => {
                    if (part.match(atMentionsPattern)) {
                        return <CharacterMention key={`mention-${i}-${j}`} name={part.replaceAll('@', '')}/>;
                    }

                    return part;
                }).reduce((acc, curr) => {
                    if (typeof curr === 'string' && typeof acc[acc.length - 1] === 'string') {
                        acc[acc.length - 1] += ` ${curr}`;
                    } else {
                        acc.push(' ')
                        acc.push(curr);
                        acc.push(' ')
                    }
                    return acc;
                }, [] as ReactNode[]);
            });
        },
        [children]
    );

    const processedContent = findAtMentions(findURLs(children));

    return <div className="overflow-auto max-w-60 scrollbar-pill">{processedContent}</div>;
};


const ChatMessageOwner = ({message, children}: { message: ChatMessage, children?: ReactNode }) => {
    return (
        <div className="flex gap-1 flex-row-reverse mr-3 ">
            <img src={message.character.avatar}
                 className={`w-8 h-8 rounded-full border border-${message.character?.className?.toLowerCase()} self-end`}
                 alt={`${message.character.name}'s avatar`}/>
            <div className="flex flex-col gap-1 p-2 rounded-l-xl rounded-tr-xl bg-moss border border-moss-100">
                <div className="flex gap-1 items-center">
                    <span
                        className={`font-bold text-${message.character?.className?.toLowerCase()}`}>{message.character.name}</span>
                    <span className="text-sm text-gray-400">{message.created}</span>
                </div>
                <ChatMessageContent>{message.content}</ChatMessageContent>
            </div>
        </div>
    )
}

const ChatMessageOther = ({message, reactionsHandler}: { message: ChatMessage, reactionsHandler: ReactNode }) => {

    return (
        <div className="flex gap-1 ml-3">
            <img src={message.character.avatar}
                 className={`w-8 h-8 rounded-full border border-${message.character?.className?.toLowerCase()} self-end`}
                 alt={`${message.character.name}'s avatar`}/>
            <div className="flex flex-col gap-1 p-2 rounded-r-xl rounded-tl-xl bg-dark border border-dark-100 relative">
                <div className="flex gap-1 items-center">
                    <Link href={`/roster/${encodeURIComponent(message.character.name.toLowerCase())}`} target="_blank">
                        <span
                            className={`font-bold text-${message.character.className?.toLowerCase()}`}>{message.character.name}</span>
                    </Link>
                    <span className="text-sm text-gray-500">{message.created}</span>
                </div>
                <ChatMessageContent>{message.content}</ChatMessageContent>
                <div className="absolute -top-3 -right-0">
                    {reactionsHandler}
                </div>
            </div>
        </div>
    )
}

const ChatMessage = ({message, reactionsHandler}: {
    message: ChatMessage,
    reactionsHandler: ReactNode
}) => {
    const session = useSessionStore(state => state.session)
    const isCurrentUser = useMemo(() => session?.id === message.character.id, [session, message])

    return (
        isCurrentUser ? <ChatMessageOwner message={message}/> :
            <ChatMessageOther message={message} reactionsHandler={reactionsHandler}/>
    )
}

const AddReactionButton = ({messageId, addReaction, emojis}: {
    messageId: number,
    emojis: Reaction[],
    addReaction: ({messageId, reactionId}: { messageId: number, reactionId: number }) => void
}) => {
    const [expanded, setExpanded] = useState(false)
    const {isOpen, onOpenChange, onClose} = useDisclosure()

    const singleAddReaction = useCallback((messageId: number, reaction: number) => {
        addReaction({messageId, reactionId: reaction})
        onClose()
    }, [messageId])

    return (
        <Popover isOpen={isOpen} onOpenChange={onOpenChange}>
            <PopoverTrigger>
                <Button
                    isIconOnly
                    radius="full"
                    variant="light"
                    size="sm"
                    className="text-xs border-none rounded-full text-primary"
                >
                    <SmilePlus className="w-4 h-4"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className={`bg-dark border border-dark-100 rounded-xl`}>
                <div className="transition-all">
                    <div className="flex gap-1">
                        {emojis.slice(0, 4).map(emoji => {
                            return <Button
                                key={emoji.id}
                                isIconOnly
                                variant="light"
                                radius="full"
                                onClick={() => singleAddReaction(messageId, emoji.id)}
                            >
                                {emoji.emoji}
                            </Button>
                        })}
                        <Button
                            isIconOnly
                            variant="light"
                            onPress={() => setExpanded(!expanded)}
                            radius="full">
                            {!expanded ? <ChevronDown className="w-4 h-4 text-primary"/> :
                                <ChevronUp className="w-4 h-4 text-primary"/>}
                        </Button>
                    </div>
                    <div
                        className={`flex gap-1 pr-5 flex-wrap  scrollbar-pill ${expanded ? 'w-52 h-40 opacity-100 overflow-auto' : 'w-52 h-0 opacity-0 overflow-hidden'} transition-all `}>
                        {emojis.slice(4).map(emoji => {
                            return <Button
                                key={emoji.id}
                                isIconOnly
                                variant="light"
                                radius="full"
                                onClick={() => singleAddReaction(messageId, emoji.id)}
                            >
                                {emoji.emoji}
                            </Button>
                        })}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export function ChatMessages({messages, addReaction, emojis, removeReaction}: {
    messages: ChatMessage[],
    addReaction: ({messageId, reactionId}: { messageId: number, reactionId: number }) => void
    removeReaction: ({messageId}: { messageId: number }) => void
    emojis: { shortcut: string, emoji: string, description: string, id: number }[]
}) {

    const chatRef = useRef<HTMLDivElement>(null)
    const [isUserAtBottom, setIsUserAtBottom] = useState(true);

    const handleScroll = () => {
        if (chatRef.current) {
            const {scrollTop, scrollHeight, clientHeight} = chatRef.current;
            setIsUserAtBottom(scrollHeight - scrollTop <= clientHeight + 10);
        }
    };

    useEffect(() => {
        chatRef.current?.scrollIntoView({behavior: "smooth"})
        chatRef.current?.scrollTo(0, chatRef.current.scrollHeight)
    }, []);

    useEffect(() => {
        if (isUserAtBottom && chatRef.current) {
            chatRef.current?.scrollIntoView({behavior: "smooth"})
            chatRef.current.scrollTo(0, chatRef.current.scrollHeight);
        }
    }, [messages, isUserAtBottom]);
    const session = useSessionStore(state => state.session)

    return (
        !messages?.length ? <div className="flex justify-center items-center w-full h-full">Write something</div> :
            <div ref={chatRef} className="w-full h-full flex flex-col gap-4 overflow-auto scrollbar-pill pb-1"
                 onScroll={handleScroll}>
                {messages.map((message, index) => {
                    const isCurrentUser = message.character.id === session?.id
                    const userReacted = message.reactions?.find(reaction => reaction.character.id === session?.id)
                    return <div key={index} className="flex flex-col gap-0.5 relative">
                        <ChatMessage message={message} reactionsHandler={
                            <AddReactionButton addReaction={addReaction}
                                               messageId={message.id}
                                               emojis={emojis}/>
                        }/>
                        <div>
                            {!!message?.reactions?.length && (
                                <Tooltip
                                    content={<div
                                        className="flex gap-1 flex-wrap flex-col">
                                        {message.reactions.map(({
                                                                    reaction,
                                                                    character
                                                                }) => {
                                            return <Link
                                                href={`/roster/${encodeURIComponent(character.character?.name.toLowerCase())}`}
                                                key={reaction.id}
                                                className="text-xs">{reaction.emoji} {character.character?.name}</Link>
                                        })}
                                    </div>}
                                >
                                    <div
                                        onClick={() => removeReaction({messageId: message.id})}
                                        className={`py-2 px-3 bg-wood border border-wood-100 rounded-full inline-flex  ${isCurrentUser ? 'float-right mr-12' : 'ml-12'} gap-1 ${userReacted ? 'cursor-pointer' : ''}`}>
                                        <div className="inline-flex gap-0.5">
                                            {message?.reactions?.reduce((acc, next) => {
                                                if (acc.find(({reaction}) => reaction.id === next.reaction.id)) {
                                                    return acc
                                                }
                                                return [...acc, next]
                                            }, [] as MessageReaction[]).slice(0, 8)?.map(({reaction}, index) => {
                                                return <span
                                                    key={index}
                                                    onClick={() => {
                                                        if (userReacted) return removeReaction({messageId: message.id})
                                                        addReaction({
                                                            messageId: message.id,
                                                            reactionId: reaction.id
                                                        })
                                                    }}
                                                    className="text-xs cursor-pointer">{reaction.emoji}</span>
                                            })}
                                        </div>
                                        {message?.reactions?.length ?
                                            <span
                                                className="text-xs text-gold">{message.reactions.length}</span> : null}
                                    </div>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                })}
            </div>
    )
}
