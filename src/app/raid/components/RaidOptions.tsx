'use client';
import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faBackward,
    faCalendarDay,
    faForward,
    faGear,
    faGift,
    faCartPlus,
    faShareNodes
} from "@fortawesome/free-solid-svg-icons";
import {useRouter} from "next/navigation";

const KEYS = {
    NEXT: 'next',
    PREVIOUS: 'previous',
    CURRENT: 'current',
    LOOT: 'loot',
    SOFT_RESERV: 'soft-reserv',
    SHARE: 'share'
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
                    if(key === KEYS.SOFT_RESERV) {
                        router.push(`/raid/${currentResetId}/soft-reserv`)
                    }
                    if(key === KEYS.SHARE) {
                        const url = window.location.href
                        if(!navigator?.clipboard?.writeText) {
                            alert('Could not copy link to clipboard')
                            return
                        }
                        navigator.clipboard.writeText(url.substring(
                            0,
                            url.indexOf('-') - 1
                        )).then(() => {
                            alert('Link copied to clipboard')
                        }).catch(() => {
                            alert('Could not copy link to clipboard')
                        })
                    }
                }}
                aria-label="Raid actions">
                <DropdownItem
                    isDisabled={!nextResetId}
                    key={KEYS.NEXT}
                    className="flex items-center gap-2 justify-between"
                >
                    <div className="flex items-center gap-2 justify-between">
                        Next <FontAwesomeIcon icon={faForward}/>
                    </div>
                </DropdownItem>
                <DropdownItem
                    key={KEYS.PREVIOUS}
                    isDisabled={!previousResetId}
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
                    isDisabled={!hasLoot}>
                    <div className="flex items-center gap-2 justify-between">
                        Loot <FontAwesomeIcon icon={faGift}/>
                    </div>
                </DropdownItem>
                <DropdownItem
                    key={KEYS.SOFT_RESERV}
                    >
                    <div className="flex items-center gap-2 justify-between">
                        Soft Reserv <FontAwesomeIcon icon={faCartPlus}/>
                    </div>
                </DropdownItem>
                <DropdownItem
                    key={KEYS.SHARE}
                >
                    <div className="flex items-center gap-2 justify-between">
                        Share link <FontAwesomeIcon icon={faShareNodes} />
                    </div>
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}
