import {type ChatMessage} from "./chatStore";
import {ReactNode, useCallback, useEffect, useRef, useState} from "react";
import {useSessionStore} from "@hooks/useSessionStore";
import Link from "next/link";
import {useQuery} from "@tanstack/react-query";
import {Spinner} from "@nextui-org/react";

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
        <div className="inline-flex items-baseline text-gray-500 whitespace-nowrap"><Spinner size="sm"
                                                                                             color="current"/>{capitalize(name)}
        </div> : isAvailable ? (
            <Link href={`/roster/${encodeURIComponent(name.toLowerCase())}`} target="_blank" className="text-blue-500">
                @{capitalize(name)}
            </Link>
        ) : (<span>@{name}</span>)
}

const UrlLink = ({href}: { href: string }) => {
    //2fbb4cbd6e9fdb2b8ee6b0c53dec03a7

    const {data: linkMetadata, isLoading} = useQuery({
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
        staleTime: 1000 * 60 * 5 // 5 minutes
    })

    return linkMetadata?.title ? (
            <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
            >
                {linkMetadata.title}
                {linkMetadata.image &&
                  <div className="flex w-full items-center justify-center">
                    <img src={linkMetadata.image} alt={linkMetadata.title}
                         className="max-w-52 max-h-32 rounded-xl border-blue-500 border"/>
                  </div>}
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
    children: string | ReactNode }) => {
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

    return <p className="overflow-auto max-w-60 scrollbar-pill">{processedContent}</p>;
};


const ChatMessageOwner = ({message}: { message: ChatMessage }) => {
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

const ChatMessageOther = ({message}: { message: ChatMessage }) => {

    return (
        <div className="flex gap-1 ml-3">
            <img src={message.character.avatar}
                 className={`w-8 h-8 rounded-full border border-${message.character?.className?.toLowerCase()} self-end`}
                 alt={`${message.character.name}'s avatar`}/>
            <div className="flex flex-col gap-1 p-2 rounded-r-xl rounded-tl-xl bg-dark border border-dark-100">
                <div className="flex gap-1 items-center">
                    <Link href={`/roster/${encodeURIComponent(message.character.name.toLowerCase())}`} target="_blank">
                        <span
                            className={`font-bold text-${message.character.className?.toLowerCase()}`}>{message.character.name}</span>
                    </Link>
                    <span className="text-sm text-gray-500">{message.created}</span>
                </div>
                <ChatMessageContent>{message.content}</ChatMessageContent>
            </div>
        </div>
    )
}

const ChatMessage = ({message}: { message: ChatMessage }) => {
    const {session} = useSessionStore(state => state)
    const isCurrentUser = session?.id === message.character.id

    return (
        isCurrentUser ? <ChatMessageOwner message={message}/> : <ChatMessageOther message={message}/>
    )
}

export function ChatMessages({messages}: { messages: ChatMessage[] }) {

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

    return (
        !messages?.length ? <div className="flex justify-center items-center w-full h-full">Write something</div> :
            <div ref={chatRef} className="w-full h-full flex flex-col gap-2 overflow-auto scrollbar-pill pb-1"
                 onScroll={handleScroll}>
                {messages.map((message, index) => (
                    <ChatMessage key={index} message={message}/>
                ))}
            </div>
    )
}
