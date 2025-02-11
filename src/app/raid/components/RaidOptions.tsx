'use client';
import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@heroui/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faBackward,
    faCalendarDay,
    faCartPlus,
    faCircleInfo,
    faComments,
    faForward,
    faGear,
    faGift,
    faShareNodes,
    faTriangleExclamation,
    faUpload,
    faUsers
} from "@fortawesome/free-solid-svg-icons";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {useModal} from "@hooks/useModal";
import GroupExport from "@/app/raid/components/GroupExport";
import {useMessageBox} from "@utils/msgBox";

const KEYS = {
    NEXT: 'next',
    PREVIOUS: 'previous',
    CURRENT: 'current',
    LOOT: 'loot',
    SOFT_RESERVES: 'soft-reserves',
    SHARE: 'share',
    upload_loot: 'upload_loot',
    groupExport: 'groupExport',
    chat: 'chat'
}

export function RaidOptions({
                                nextResetId,
                                previousResetId,
                                currentResetId,
                                hasLoot,
                            }: {
    nextResetId: string,
    previousResetId: string,
    currentResetId: string,
    hasLoot: boolean
    raidStarted: boolean
}) {
    const router = useRouter()
    const {
        open,
        setModalHeader,
        setModalBody,
    } = useModal()
    const {alert} = useMessageBox()
    return (
        <Dropdown>
            <DropdownTrigger>
                <Button
                    className={'rounded bg-transparent text-default hover:bg-wood bg-moss'}
                    isIconOnly>
                    <FontAwesomeIcon icon={faGear}/>
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                onAction={(key) => {
                    if (key === KEYS.LOOT) {
                        router.push(`/raid/${currentResetId}/loot`, {
                            scroll: false
                        })
                    }
                    if (key === KEYS.CURRENT) {
                        router.push(`/raid/current`)
                    }

                    if (key === KEYS.NEXT) {
                        router.push(`/raid/${nextResetId}`)
                    }

                    if (key === KEYS.PREVIOUS) {
                        router.push(`/raid/${previousResetId}`)
                    }
                    if (key === KEYS.SOFT_RESERVES) {
                        router.push(`/raid/${currentResetId}/soft-reserv`)
                    }
                    if (key === KEYS.SHARE) {
                        const url = window.location.href
                        if (!navigator?.clipboard?.writeText) {
                            alert({message: 'Could not copy link to clipboard', type: 'error'})
                            return
                        }
                        navigator.clipboard.writeText(url.substring(
                            0,
                            url.indexOf('-')
                        )).then(() => {
                            toast.custom(() => (
                                <div
                                    className="flex gap-2 items-center justify-center bg-wood border border-wood-100 p-4 rounded-lg text-default shadow shadow-wood-100 shadow-lg">
                                    <FontAwesomeIcon icon={faCircleInfo}/>
                                    <span>Link copied to clipboard</span>
                                </div>
                            ), {
                                duration: 3000,
                                position: 'bottom-right'
                            })
                        }).catch(() => {
                            toast.custom(() => (
                                <div
                                    className="flex gap-2 items-center justify-center bg-red-600 border border-bg-red-500 p-4 rounded-lg text-default shadow shadow-wood-100 shadow-lg">
                                    <FontAwesomeIcon icon={faTriangleExclamation}/>
                                    <span>An error occurred while copying the link to the clipboard!</span>
                                </div>
                            ), {
                                duration: 3000,
                                position: 'bottom-right'
                            })
                        })
                    }
                    if (key === KEYS.upload_loot) {
                        router.push(`/raid/${currentResetId}/loot/upload`)
                    }
                    if (key === KEYS.chat) {
                        router.push(`/raid/${currentResetId}/chat`)
                    }
                    if (key === KEYS.groupExport) {
                        setModalHeader(
                            <div>
                                <h2 className="
                                    text-2xl
                                    font-bold
                                    text-gold
                                ">Group export</h2>
                            </div>
                        )
                        setModalBody(
                            <div>
                                <p>Group export is not yet implemented</p>
                            </div>
                        )
                        setModalBody(
                            <GroupExport
                                resetId={currentResetId}
                            />
                        )
                        open()

                    }
                }}
                aria-label="Raid actions">
                <DropdownItem
                    isReadOnly={!nextResetId}
                    key={KEYS.NEXT}
                    className="flex items-center gap-2 justify-between"
                >
                    <div className="flex items-center gap-2 justify-between">
                        Next <FontAwesomeIcon icon={faForward}/>
                    </div>
                </DropdownItem>
                <DropdownItem
                    key={KEYS.PREVIOUS}
                    isReadOnly={!previousResetId}
                >
                    <div className="flex items-center gap-2 justify-between">
                        Previous <FontAwesomeIcon icon={faBackward}/>
                    </div>
                </DropdownItem>
                <DropdownItem key={KEYS.CURRENT}>
                    <div className="flex items-center gap-2 justify-between">
                        Current <FontAwesomeIcon icon={faCalendarDay}/>
                    </div>
                </DropdownItem>
                <DropdownItem
                    key={KEYS.LOOT}
                    isReadOnly={!hasLoot}>
                    <div className="flex items-center gap-2 justify-between">
                        Loot <FontAwesomeIcon icon={faGift}/>
                    </div>
                </DropdownItem>
                <DropdownItem
                    key={KEYS.SOFT_RESERVES}
                >
                    <div className="flex items-center gap-2 justify-between">
                        Soft Reserves <FontAwesomeIcon icon={faCartPlus}/>
                    </div>
                </DropdownItem>
                <DropdownItem
                    key={KEYS.SHARE}
                >
                    <div className="flex items-center gap-2 justify-between">
                        Share link <FontAwesomeIcon icon={faShareNodes}/>
                    </div>
                </DropdownItem>
                <DropdownItem
                    key={KEYS.chat}
                >
                    <div className="flex items-center gap-2 justify-between">
                        Chat <FontAwesomeIcon icon={faComments}/>
                    </div>
                </DropdownItem>
                <DropdownItem
                    key={KEYS.groupExport}
                >
                    <div className="flex items-center gap-2 justify-between">
                        Group export<FontAwesomeIcon icon={faUsers}/>
                    </div>
                </DropdownItem>
                <DropdownItem
                    key={KEYS.upload_loot}
                >
                    <div className="flex items-center gap-2 justify-between">
                        Upload loot <FontAwesomeIcon icon={faUpload}/>
                    </div>
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}
