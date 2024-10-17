import {create as createStore} from "zustand";

export type ChatMessage = {
    id: number;
    character: {
        id: number;
        name: string;
        avatar: string;
    }
    created: string;
    content: string;
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
    addMessage: (message: ChatMessage) => set((state) => ({messages: [...state.messages, message]})),
    setMessages: (messages: ChatMessage[]) => set({messages}),
    setCurrentMessage: (currentMessage) => set({currentMessage})
}));
