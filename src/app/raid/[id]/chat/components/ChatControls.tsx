import { Input, Tooltip } from "@heroui/react";
import { Button } from "@/app/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useChatStore } from "@/app/raid/[id]/chat/components/chatStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/app/context/AuthContext";

export function ChatControls({ onSubmit, showRedirect }: {
    showRedirect?: boolean
    onSubmit: (message: string) => void
}) {
    const { currentMessage, setCurrentMessage } = useChatStore(useShallow(state => ({
        currentMessage: state.currentMessage,
        setCurrentMessage: state.setCurrentMessage,
    })))

    const { user } = useAuth()
    console.log('User in ChatControls:', user)
    return (
        <div className="w-full flex gap-2 relative">
            <Input placeholder="What's on your mind!?"
                size={showRedirect ? 'sm' : 'md'}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target?.value ?? '')}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        if (!currentMessage) return
                        onSubmit(currentMessage)
                        setCurrentMessage('')
                    }
                }}
                isDisabled={user?.isTemporal}
            />
            <Tooltip
                content={'Only available to Battle.net OAuth users'}
                isDisabled={!user?.isTemporal}>
                <div>
                    <Button
                        isDisabled={user?.isTemporal || !currentMessage}
                        onPress={() => {
                            onSubmit(currentMessage)
                            setCurrentMessage('')
                        }}
                        isIconOnly size={showRedirect ? 'sm' : 'md'} className="text-default rounded-lg">
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </Button>
                </div>
            </Tooltip>
        </div>
    )
}
