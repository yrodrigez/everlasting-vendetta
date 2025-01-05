import {Popover, PopoverContent, PopoverTrigger, useDisclosure} from "@nextui-org/react";
import {useAssistanceStore} from "@/app/raid/components/assistanceStore";
import {useSession} from "@/app/hooks/useSession";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {assistRaid} from "@/app/raid/components/utils";

import {ShouldReserveModal} from "@/app/raid/components/ShouldReserveModal";
import {getRoleIcon} from "@/app/apply/components/utils";
import {PLAYABLE_ROLES} from "@utils/constants";
import {isRoleAssignable} from "@/app/components/ProfileManager";
import {useCharacterStore} from "@/app/components/characterStore";
import {Button} from "@/app/components/Button";
import {useRouter} from "next/navigation";


export function ConfirmAssistance({raidId, hasLootReservations = false}: {
    raidId: string,
    hasLootReservations?: boolean
}) {
    const selectedDays = useAssistanceStore(state => state.selectedDays)
    const {selectedCharacter} = useSession()
    const selectedRole = selectedCharacter?.selectedRole
    const [loading, setLoading] = useState(false)
    const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure()
    const className = selectedCharacter?.playable_class?.name
    const {setRole} = useCharacterStore(({setRole}) => ({setRole}))
    const assignableRoles = useMemo(() => {
        return Object.values(PLAYABLE_ROLES).filter(role => role.value.split('-').every((x: string) => isRoleAssignable(x.toLowerCase(), className?.toLowerCase())))
    }, [className, selectedRole, selectedCharacter])

    const {isOpen: isOpenRoles, onOpenChange: onOpenChangeRoles, onOpen: onOpenRoles} = useDisclosure()
    const [isHovering, setIsHovering] = useState(false)
    const [showHint, setShowHint] = useState(false)
    useEffect(() => {
        if (!isHovering || isOpenRoles) {
            setShowHint(false)
        } else {
            const timeout = setInterval(() => {
                if (isHovering) {
                    setShowHint(true)
                } else {
                    setShowHint(false)
                }
            }, 800)

            return () => clearTimeout(timeout)
        }
    }, [isHovering, isOpenRoles, onOpenChangeRoles])

    const confirmRaid = useCallback((async (role = selectedRole) => {
        setLoading(true)
        await assistRaid(raidId, selectedDays, selectedCharacter, role, 'confirmed', hasLootReservations, onOpen)
        setLoading(false)
    }), [raidId, selectedDays, selectedCharacter, selectedRole, hasLootReservations, onOpen])
    const router = useRouter()

    return (
        <>
            <Button
                disabled={loading || !selectedDays?.length || isOpenRoles}
                isDisabled={loading || !selectedDays?.length}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                isLoading={loading}
                spinnerPlacement="end"
                className={'bg-moss text-gold rounded border border-gold/50'}
                onPress={() => {
                    if (showHint) {
                        onOpenRoles()
                        return
                    }
                    confirmRaid()
                }}
                endContent={selectedRole && (
                    <Popover
                        isOpen={isOpenRoles}
                        onOpenChange={onOpenChangeRoles}
                    >
                        <PopoverTrigger>
                            <div className={`relative min-w-6 min-h-6 group `}>
                                {
                                    selectedRole.split('-').map((roleValue, i) => (
                                        <img
                                            key={roleValue}
                                            className={`
                                            absolute top-0 ${i === 0 ? 'left-0' : 'left-3'}
                                            w-6 h-6
                                            rounded-full
                                            transition-all duration-300
                                            ${showHint ? `glow-animation` : ``}
                                        `}
                                            src={getRoleIcon(roleValue)}
                                            alt={roleValue}
                                        />
                                    ))}
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className={`bg-transparent border-none shadow-none`}>
                            <div
                                className="flex gap-2 p-2"
                            >
                                {assignableRoles.map(
                                    (role, i) => {
                                        return (
                                            <Button
                                                key={i}
                                                style={{
                                                    opacity: 1
                                                }}
                                                className={
                                                    `bg-moss text-gold rounded border border-moss-100 relative hover:bg-dark hover:border-dark-100 opacity-100`
                                                    + ` ${selectedRole === role.value ? 'bg-dark text-gold border-gold' : ''}`
                                                }
                                                onPress={() => {
                                                    if (selectedRole !== role.value) setRole(role.value)
                                                    setTimeout(() =>
                                                            confirmRaid(role.value).then(() => {
                                                                router.refresh()
                                                                onOpenChangeRoles()
                                                            })
                                                        , 400)
                                                }}
                                            ><span className="relative min-w-6 max-w-12 h-6 group">
                            {role.value.split('-').map((roleValue, i, arr) => (
                                <img
                                    key={i}
                                    className={`
                                        absolute top-0 ${(i === 0 && arr.length === 1) ? 'left-0' : (i === 0 && arr.length > 1) ? '-left-1.5' : 'left-2.5'}
                                        w-6 h-6
                                        rounded-full border border-gold
                                        
                                    `}
                                    src={getRoleIcon(roleValue)}
                                    alt={roleValue}
                                />
                            ))}
                            </span>
                                            </Button>
                                        )
                                    }
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            >Confirm as
            </Button>
            <ShouldReserveModal
                raidId={raidId}
                isOpen={isOpen}
                onClose={onClose}
                onOpenChange={onOpenChange}
            />
        </>
    )
}
