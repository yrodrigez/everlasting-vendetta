import {type ChatMessage} from "./chatStore";
import {useEffect, useRef, useState} from "react";
import {useSessionStore} from "@hooks/useSessionStore";
import Link from "next/link";

const ChatMessageOwner = ({message}: { message: ChatMessage }) => {
    return (
        <div className="flex gap-1 flex-row-reverse mr-3 ">
            <img src={message.character.avatar} className={`w-8 h-8 rounded-full border border-${message.character?.className?.toLowerCase()} self-end`}
                 alt={`${message.character.name}'s avatar`}/>
            <div className="flex flex-col gap-1 p-2 rounded-l-xl rounded-tr-xl bg-moss border border-moss-100">
                <div className="flex gap-1 items-center">
                    <span className={`font-bold text-${message.character?.className?.toLowerCase()}`}>{message.character.name}</span>
                    <span className="text-sm text-gray-400">{message.created}</span>
                </div>
                <div>{message.content}</div>
            </div>
        </div>
    )
}

const ChatMessageOther = ({message}: { message: ChatMessage }) => {

    return (
        <div className="flex gap-1 ml-3">
            <img src={message.character.avatar} className={`w-8 h-8 rounded-full border border-${message.character?.className?.toLowerCase()} self-end`}
                 alt={`${message.character.name}'s avatar`}/>
            <div className="flex flex-col gap-1 p-2 rounded-r-xl rounded-tl-xl bg-dark border border-dark-100">
                <div className="flex gap-1 items-center">
                    <Link href={`/roster/${encodeURIComponent(message.character.name.toLowerCase())}`} target="_blank">
                        <span className={`font-bold text-${message.character.className?.toLowerCase()}`}>{message.character.name}</span>
                    </Link>
                    <span className="text-sm text-gray-500">{message.created}</span>
                </div>
                <div>{message.content}</div>
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
            <div ref={chatRef} className="w-full h-full flex flex-col gap-2 overflow-auto scrollbar-pill justify-end"
                 onScroll={handleScroll}>
                {messages.map((message, index) => (
                    <ChatMessage key={index} message={message}/>
                ))}
            </div>
    )
}
