import {create as createStore} from "zustand";
import {MessageReaction} from "@/app/raid/[id]/chat/components/useReactions";

export type ChatMessage = {
    id: number;
    character: {
        className: string;
        id: number;
        name: string;
        avatar: string;
    }
    created: string;
    content: string;
    reactions?: MessageReaction[]
}


interface ChatMessageStore {
    messages: ChatMessage[]
    currentMessage: string
    addMessage: (message: ChatMessage) => void
    setMessages: (messages: ChatMessage[]) => void
    setCurrentMessage: (message: string) => void
}

const initialState = {
    currentMessage: '',
    messages: []
}

export const useChatStore = createStore<ChatMessageStore>((set) => ({
    ...initialState,
    addMessage: (message: ChatMessage) => set((state) => {
        if (state.messages.find(m => m.id === message.id)) return state // don't add duplicates
        return ({messages: [...state.messages, message]})
    }),
    setMessages: (messages: ChatMessage[]) => set({messages}),
    setCurrentMessage: (currentMessage) => set({currentMessage})
}));
