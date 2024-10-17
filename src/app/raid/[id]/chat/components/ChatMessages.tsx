import {type ChatMessage} from "./chatStore";
import {useEffect, useRef, useState} from "react";
import {useSessionStore} from "@hooks/useSessionStore";

const ChatMessage = ({message}: { message: ChatMessage }) => {
    const {session} = useSessionStore(state => state)
    const isCurrentUser = session?.id === message.character.id

    return (
        <div className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse mr-4' : 'flex-row ml-4'}`}>
            <img src={message.character.avatar} className="w-8 h-8 rounded-full"
                 alt={`${message.character.name}'s avatar`}/>
            <div className={`flex flex-col gap-1 p-2 rounded  border ${isCurrentUser ? 'bg-moss border-wood': 'bg-dark border-dark-100'}`}>
                <div className="flex gap-1">
                    <span className="font-bold">{message.character.name}</span>
                    <span className="text-sm text-gray-500">{message.created}</span>
                </div>
                <div>{message.content}</div>
            </div>
        </div>
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
            <div ref={chatRef} className="w-full h-full flex flex-col gap-2 overflow-auto scrollbar-pill"
                 onScroll={handleScroll}>
                {messages.map((message, index) => (
                    <ChatMessage key={index} message={message}/>
                ))}
            </div>
    )
}
