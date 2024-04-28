'use client';
import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBackward, faCalendarDay, faForward, faGear, faGift} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export function RaidOptions({nextResetId, previousResetId, currentResetId, hasLoot}: {
    nextResetId: string,
    previousResetId: string,
    currentResetId: string,
    hasLoot: boolean
}) {
    return (
        <Dropdown>
            <DropdownTrigger>
                <Button
                    variant={'light'}
                    className={'rounded-full bg-transparent text-default hover:text-gold hover:bg-wood'}
                    isIconOnly>
                    <FontAwesomeIcon icon={faGear}/>
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Raid actions">
                <DropdownItem
                    isDisabled={!nextResetId}
                >
                    <Link
                        href={`/raid/${nextResetId}`}
                        className="flex items-center gap-2 justify-between">
                        Next
                        <FontAwesomeIcon icon={faForward}/>
                    </Link>
                </DropdownItem>
                <DropdownItem
                    isDisabled={!previousResetId}
                >
                    <Link
                        href={`/raid/${previousResetId}`}
                        className="flex items-center gap-2 justify-between">
                        Previous
                        <FontAwesomeIcon icon={faBackward}/>
                    </Link>
                </DropdownItem>
                <DropdownItem>
                    <Link
                        href={`/raid/current`}
                        className="flex items-center gap-2 justify-between">
                        Current
                        <FontAwesomeIcon icon={faCalendarDay}/>
                    </Link>
                </DropdownItem>
                <DropdownItem isDisabled={!hasLoot}>
                    <Link
                        href={`/raid/${currentResetId}/loot`}
                        className="flex items-center gap-2 justify-between">
                        Loot
                        <FontAwesomeIcon icon={faGift}/>
                    </Link>
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}
