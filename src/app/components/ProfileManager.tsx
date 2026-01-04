'use client'
import CharacterAvatar from "@/app/components/CharacterAvatar";
import { AuthManagerWindow } from "@/app/components/auth-manager-window";
import { useCharacterStore } from "@/app/components/characterStore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    Spinner, Tooltip
} from "@heroui/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { getRoleIcon } from "@/app/apply/components/utils";
import {
    faLink,
    faPersonCircleQuestion,
    faRightFromBracket,
    faRightLeft,
    faUser,
    type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useAuthManagerWindowStore } from "../stores/auth-manager-window-store";
import { createClientComponentClient } from "../util/supabase/createClientComponentClient";
import { useVistaStore } from "./character-selection/vista-store";
import { Swords } from "./svg-icons";

export function isRoleAssignable(role: 'tank' | 'healer' | 'dps' | string, characterClass: string | undefined, realmSlug: string = 'living-flame'): boolean {
    if (!characterClass) return false
    const healingClasses = realmSlug === 'living-flame' ? ['priest', 'paladin', 'shaman', 'druid', 'mage'] : ['priest', 'paladin', 'shaman', 'druid']
    const tankClasses = realmSlug === 'living-flame' ? ['warrior', 'paladin', 'druid', 'rogue', 'warlock'] : ['warrior', 'paladin', 'druid']
    const rdpsClasses = realmSlug === 'living-flame' ? ['druid', 'priest', 'mage', 'warlock', 'hunter'] : ['druid', 'priest', 'mage', 'warlock', 'hunter']
    const dpsClasses = realmSlug === 'living-flame' ? ['warrior', 'paladin', 'hunter', 'rogue', 'shaman', 'druid'] : ['warrior', 'paladin', 'rogue', 'shaman', 'druid'] // melee dps

    if (role === 'tank') {
        return tankClasses.includes(characterClass)
    }
    if (role === 'healer') {
        return healingClasses.includes(characterClass)
    }

    if (role === 'rdps') {
        return rdpsClasses.includes(characterClass)
    }

    return dpsClasses.includes(characterClass)
}

const MenuItem = ({ text, onClick, icon }: { text: string, onClick: () => void, icon: IconDefinition | string | React.ReactNode }) => {
    const IconComponent = useMemo(() => {
        if (!icon) return null;
        if (typeof icon === 'string') {
            return <img src={icon} alt={text} className="w-6 h-6 rounded-full border border-gold" />;
        }
        if (typeof icon === 'object' && 'iconName' in icon) {
            return <FontAwesomeIcon icon={icon} />;
        }
        return icon;
    }, [icon, text]);
    return (
        <div
            onClick={onClick}
            className="text-small flex py-2 px-2 gap-2 cursor-pointer rounded items-center justify-between hover:bg-white hover:bg-opacity-20 hover:backdrop-filter hover:backdrop-blur-md">
            {text} {
                IconComponent
            }
        </div>
    )
}


export default function ProfileManager() {
    const selectedCharacter = useCharacterStore(state => state.selectedCharacter)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const { accessToken, isAuthenticated, user, logout } = useAuth()
    const supabase = useMemo(() => createClientComponentClient(accessToken), [accessToken]);

    const router = useRouter()

    const handleLogout = useCallback(async () => {
        await logout()
        router.refresh()
        setPopoverOpen(false)
    }, [logout, router])

    const openAuthManagerWindow = useAuthManagerWindowStore(state => state.onOpen);
    const setVista = useVistaStore(state => state.setVista);

    useEffect(() => {
        if (!user || !isAuthenticated || !supabase) return

        if (!selectedCharacter) {
            openAuthManagerWindow()
            return
        }

        if (!selectedCharacter.selectedRole) {
            openAuthManagerWindow()
            return
        }
    }, [selectedCharacter, user, isAuthenticated, supabase, router])

    return (<>
        <Popover isOpen={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger>
                <div
                    className="px-1 py-2 lg:px-2 lg:py-1 flex flex-col items-center rounded-xl hover:cursor-pointer hover:bg-white hover:bg-opacity-20 hover:backdrop-filter hover:backdrop-blur-md"
                >
                    {!selectedCharacter?.name ? (<>
                        <Spinner color={'success'} />
                        <Tooltip
                            content={!selectedCharacter?.name ? 'Selecting character...' : 'loading...'}
                        >
                            <div className="w-full h-full overflow-hidden">
                                {!selectedCharacter?.name ? 'Selecting character...' : 'loading...'}
                            </div>
                        </Tooltip>
                    </>) : (<>
                        <CharacterAvatar
                            characterName={selectedCharacter.name}
                            realm={selectedCharacter.realm.slug}
                            className="rounded-full w-9 h-9 border border-gold"
                            role={selectedCharacter?.selectedRole}
                            avatarUrl={selectedCharacter?.avatar}
                        />
                        <span>{selectedCharacter.name}</span>
                    </>)}

                </div>
            </PopoverTrigger>
            <PopoverContent
                className="bg-wood">
                {selectedCharacter?.name && selectedCharacter?.selectedRole && (
                    <div className="px-1 py-2 min-w-48">
                        <div className="text-xl font-bold mb-4">Options</div>
                        <MenuItem
                            text="My profile"
                            onClick={() => {
                                router.push(`/profiles/me`);
                                setPopoverOpen(false)
                            }}
                            icon={faUser}
                        />
                        <MenuItem
                            text="Switch character"
                            onClick={() => {
                                setVista('list')
                                openAuthManagerWindow()
                                setPopoverOpen(false)
                            }}
                            icon={faRightLeft}
                        />
                        <MenuItem
                            text="Select your role"
                            onClick={() => {
                                setVista('role-selection')
                                openAuthManagerWindow()
                                setPopoverOpen(false)
                            }}
                            icon={selectedCharacter && selectedCharacter.selectedRole ? getRoleIcon(selectedCharacter.selectedRole) : faPersonCircleQuestion}
                        />
                        {user?.provider?.indexOf('bnet') === -1 && (
                            <MenuItem
                                text="Link a character"
                                onClick={() => {
                                    setVista('link')
                                    openAuthManagerWindow()
                                    setPopoverOpen(false)
                                }}
                                icon={faLink}
                            />
                        )}
                        <MenuItem text={'My armory'} onClick={() => {
                            window.location.href = `/roster/${encodeURIComponent(selectedCharacter.name.toLowerCase())}-${selectedCharacter.realm.slug}`;
                            setPopoverOpen(false)
                        }} icon={<span
                            className="w-4 h-4">
                            <Swords
                            />
                        </span>} />
                        <MenuItem text={'Logout'} onClick={handleLogout} icon={faRightFromBracket} />
                    </div>
                )}
            </PopoverContent>
        </Popover>
        <AuthManagerWindow />
    </>)
}
