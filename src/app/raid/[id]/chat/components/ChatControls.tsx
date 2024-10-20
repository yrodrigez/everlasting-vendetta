import {Input, Tooltip} from "@nextui-org/react";
import {Button} from "@/app/components/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPaperPlane} from "@fortawesome/free-solid-svg-icons";
import {useChatStore} from "@/app/raid/[id]/chat/components/chatStore";
import {useSession} from "@hooks/useSession";

export function ChatControls({onSubmit, showRedirect}: {
    showRedirect?: boolean
    onSubmit: (message: string) => void
}) {
    const {currentMessage, setCurrentMessage} = useChatStore(state => state)
    const {selectedCharacter} = useSession()
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
                   isDisabled={selectedCharacter?.isTemporal}
            />
            <Tooltip
                content={'Only available to Battle.net OAuth users'}
                isDisabled={!selectedCharacter?.isTemporal}>
                <div>
                    <Button
                        isDisabled={selectedCharacter?.isTemporal || !currentMessage}
                        onClick={() => {
                            onSubmit(currentMessage)
                            setCurrentMessage('')
                        }}
                        isIconOnly size={showRedirect ? 'sm' : 'md'} className="text-default">
                        <FontAwesomeIcon icon={faPaperPlane}/>
                    </Button>
                </div>
            </Tooltip>
        </div>
    )
}
