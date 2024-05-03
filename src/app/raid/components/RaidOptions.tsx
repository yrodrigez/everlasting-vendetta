'use client';
import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBackward, faCalendarDay, faForward, faGear, faGift, faCartPlus} from "@fortawesome/free-solid-svg-icons";
import {useRouter} from "next/navigation";

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
                    if (key === 'loot') {
                        router.push(`/raid/${currentResetId}/loot`, {
                            scroll: false
                        })
                    }
                    if (key === 'current') {
                        router.push(`/raid/current`)
                    }

                    if (key === 'next') {
                        router.push(`/raid/${nextResetId}`)
                    }

                    if (key === 'previous') {
                        router.push(`/raid/${previousResetId}`)
                    }
                    if(key === 'soft-reserv') {
                        router.push(`/raid/${currentResetId}/soft-reserv`)
                    }
                }}
                aria-label="Raid actions">
                <DropdownItem
                    isDisabled={!nextResetId}
                    key={'next'}
                    className="flex items-center gap-2 justify-between"
                >
                    <div className="flex items-center gap-2 justify-between">
                        Next <FontAwesomeIcon icon={faForward}/>
                    </div>
                </DropdownItem>
                <DropdownItem
                    key={'previous'}
                    isDisabled={!previousResetId}
                >
                    <div className="flex items-center gap-2 justify-between">
                        Previous <FontAwesomeIcon icon={faBackward}/>
                    </div>
                </DropdownItem>
                <DropdownItem key={'current'}>
                    <div className="flex items-center gap-2 justify-between">
                        Current <FontAwesomeIcon icon={faCalendarDay}/>
                    </div>
                </DropdownItem>

                <DropdownItem
                    key={'loot'}
                    isDisabled={!hasLoot}>
                    <div className="flex items-center gap-2 justify-between">
                        Loot <FontAwesomeIcon icon={faGift}/>
                    </div>
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}
