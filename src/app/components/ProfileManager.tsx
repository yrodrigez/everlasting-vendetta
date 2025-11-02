'use client'
import React, { useCallback, useEffect, useMemo, useState } from "react";
import CharacterAvatar from "@/app/components/CharacterAvatar";
import { BattleNetAuthManagerWindow } from "@/app/components/BattleNetAuthManagerWindow";
import { useCharacterStore } from "@/app/components/characterStore";
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    Popover,
    PopoverContent,
    PopoverTrigger, ScrollShadow,
    Spinner, Tooltip
} from "@heroui/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
    faRightLeft,
    faPersonCircleQuestion,
    faUser,
    faRightFromBracket,
    type IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { getRoleIcon } from "@/app/apply/components/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PLAYABLE_ROLES } from "@utils/constants";
import { useAuth } from "../context/AuthContext";
import { createClientComponentClient } from "../util/supabase/createClientComponentClient";

export function isRoleAssignable(role: 'tank' | 'healer' | 'dps' | string, characterClass: string | undefined, realmSlug: string = 'living-flame'): boolean {
    if (!characterClass) return false
    const healingClasses = realmSlug === 'living-flame' ? ['priest', 'paladin', 'shaman', 'druid', 'mage'] : ['priest', 'paladin', 'shaman', 'druid']
    const tankClasses = realmSlug === 'living-flame' ? ['warrior', 'paladin', 'druid', 'rogue', 'warlock'] : ['warrior', 'paladin', 'druid']
    const rdpsClasses = realmSlug === 'living-flame' ? ['druid', 'priest', 'mage', 'warlock', 'hunter'] : ['druid', 'priest', 'mage', 'warlock', 'hunter']
    const dpsClasses = realmSlug === 'living-flame' ? ['warrior', 'paladin', 'hunter', 'rogue', 'shaman', 'druid'] : ['warrior', 'paladin','rogue', 'shaman', 'druid'] // melee dps

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

const MenuItem = ({ text, onClick, icon }: { text: string, onClick: () => void, icon: IconDefinition | string }) => {
    return (
        <div
            onClick={onClick}
            className="text-small flex py-2 px-2 gap-2 cursor-pointer rounded items-center justify-between hover:bg-white hover:bg-opacity-20 hover:backdrop-filter hover:backdrop-blur-md">
            {text} {
                !icon ? null :
                    typeof icon === 'string' ?
                        <img src={icon} alt={text} className="w-6 h-6 rounded-full border border-gold" /> :
                        <FontAwesomeIcon icon={icon} />
            }
        </div>
    )
}


export default function ProfileManager() {
    const [isCharacterSelectWindowOpen, setIsCharacterSelectWindowOpen] = useState(false)
    const [isRoleSelectWindowOpen, setIsRoleSelectWindowOpen] = useState(false)
    const selectedCharacter = useCharacterStore(state => state.selectedCharacter)
    const setSelectedCharacter = useCharacterStore(state => state.setSelectedCharacter)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const { accessToken, isAuthenticated, user, logout } = useAuth()
    const supabase = useMemo(() => createClientComponentClient(accessToken), [accessToken]);


    const router = useRouter()

    const handleLogout = useCallback(async () => {
        await logout()
        router.refresh()
        setPopoverOpen(false)
    }, [logout, router])

    useEffect(() => {
        if (!user || !isAuthenticated || !supabase) return

        if (!selectedCharacter) {
            console.log('No character selected, opening character select window')
            if (!isCharacterSelectWindowOpen) {
                setIsCharacterSelectWindowOpen(true)
            }
            return
        }

        // Close character select if a character is now selected
        if (selectedCharacter && isCharacterSelectWindowOpen) {
            setIsCharacterSelectWindowOpen(false)
        }

        if (!selectedCharacter.selectedRole && !isRoleSelectWindowOpen) {
            setIsRoleSelectWindowOpen(true)
            return
        }

        if (selectedCharacter.selectedRole && isRoleSelectWindowOpen) {
            setIsRoleSelectWindowOpen(false)
        }
    }, [selectedCharacter, user, isAuthenticated, supabase, router])

    const assignableRoles = useMemo(() => {
        if (!selectedCharacter) return []
        return Object.values(PLAYABLE_ROLES).filter(role => role.value.split('-').every((x: string) => isRoleAssignable(x.toLowerCase(), selectedCharacter.playable_class?.name?.toLowerCase())))
    }, [selectedCharacter])


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
            <PopoverContent className="bg-wood">
                {selectedCharacter?.name && selectedCharacter?.selectedRole && (
                    <div className="px-1 py-2 min-w-48">
                        <div className="text-xl font-bold mb-4">Options</div>
                        <MenuItem
                            text="Switch character"
                            onClick={() => {
                                setIsCharacterSelectWindowOpen(true)
                                setPopoverOpen(false)
                            }}
                            icon={faRightLeft}
                        />
                        <MenuItem
                            text="Select your role"
                            onClick={() => {
                                setIsRoleSelectWindowOpen(true)
                                setPopoverOpen(false)
                            }}
                            icon={selectedCharacter && selectedCharacter.selectedRole ? getRoleIcon(selectedCharacter.selectedRole) : faPersonCircleQuestion}
                        />
                        <MenuItem text={'My armory'} onClick={() => {
                            window.location.href = `/roster/${selectedCharacter.name.toLowerCase()}`
                        }} icon={faUser} />
                        <MenuItem text={'Logout'} onClick={handleLogout} icon={faRightFromBracket} />
                    </div>
                )}
            </PopoverContent>
        </Popover>
        <BattleNetAuthManagerWindow
            open={isCharacterSelectWindowOpen}
            setExternalOpen={setIsCharacterSelectWindowOpen}
        />
        <Modal
            placement={'center'}
            hideCloseButton
            isOpen={
                isRoleSelectWindowOpen
            }>
            <ModalContent
                className="bg-wood max-h-96"
            >
                <ModalHeader>
                    <h1>Select your role</h1>
                </ModalHeader>
                <ModalBody
                    className="max-h-96 overflow-auto scrollbar-pill"
                >
                    {!supabase || !selectedCharacter ? <div>Loading...</div> :
                        <ScrollShadow className="flex flex-col gap-2 scrollbar-pill overflow-auto">
                            {assignableRoles.map(({ value: role, label: roleLabel }) => {
                                const roleKey = role
                                return (
                                    <div
                                        onClick={() => {
                                            async function updateRole() {
                                                if (!selectedCharacter || !user) return
                                                await supabase?.from('ev_member').update({
                                                    character: { ...selectedCharacter, selectedRole: roleKey }
                                                }).eq('id', selectedCharacter.id)

                                                setSelectedCharacter({
                                                    ...selectedCharacter,
                                                    selectedRole: roleKey
                                                })

                                                setIsRoleSelectWindowOpen(false);
                                                router.refresh()
                                            }

                                            updateRole().then(() => {
                                                toast.success('Role updated')
                                            }).catch(() => {
                                                toast.error('Error updating role')
                                            })
                                        }}
                                        key={role}
                                        className={`flex gap-4 items-center justify-between hover:bg-gold hover:bg-opacity-20 py-2 px-4 rounded cursor-pointer`}>
                                        <div className={'flex gap-4 items-center'}>
                                            <div className={`relative min-w-14 min-h-14 ${role.split('-').length > 1 ? 'min-w-20' : ''} `}>
                                                {
                                                    role.split('-').map((roleValue, i) => (
                                                        <img
                                                            key={roleValue}
                                                            className={`
                                            absolute top-0 ${i === 0 ? 'left-0' : 'left-7'}
                                            w-14 h-14
                                            rounded-full
                                            transition-all duration-300
                                        `}
                                                            src={getRoleIcon(roleValue)}
                                                            alt={roleValue}
                                                        />
                                                    ))}
                                            </div>
                                            <div className={'flex flex-col gap-1'}>
                                                <h2 className={'text-gold font-bold text-xl'}>{roleLabel}</h2>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </ScrollShadow>}
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}
