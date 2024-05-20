'use client'
import {useEffect, useState} from "react";
import CharacterAvatar from "@/app/components/CharacterAvatar";
import {BattleNetAuthManagerWindow} from "@/app/components/BattleNetAuthManagerWindow";
import {useCharacterStore} from "@/app/components/characterStore";
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Spinner
} from "@nextui-org/react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import {
    faRightLeft,
    faPersonCircleQuestion,
    faUser,
    faRightFromBracket,
    type IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import {getRoleIcon} from "@/app/apply/components/utils";
import {useSession} from "@/app/hooks/useSession";
import {clearAllCookies, logout} from "@/app/util";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

function isRoleAssignable(role: 'tank' | 'healer' | 'dps', characterClass?: string) {
    if (!characterClass) return false
    const healingClasses = ['priest', 'paladin', 'shaman', 'druid', 'mage']
    const tankClasses = ['warrior', 'paladin', 'druid', 'rogue', 'warlock']
    const dpsClasses = ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid']

    if (role === 'tank') {
        return tankClasses.includes(characterClass)
    }
    if (role === 'healer') {
        return healingClasses.includes(characterClass)
    }

    return dpsClasses.includes(characterClass)
}

const MenuItem = ({text, onClick, icon}: { text: string, onClick: () => void, icon: IconDefinition | string }) => {
    return (
        <div
            onClick={onClick}
            className="text-small flex py-2 px-2 gap-2 cursor-pointer rounded items-center justify-between hover:bg-white hover:bg-opacity-20 hover:backdrop-filter hover:backdrop-blur-md">
            {text} {
            !icon ? null :
                typeof icon === 'string' ?
                    <img src={icon} alt={text} className="w-6 h-6 rounded-full border border-gold"/> :
                    <FontAwesomeIcon icon={icon}/>
        }
        </div>
    )
}


export default function ProfileManager() {
    const [token, setToken] = useState({name: 'bnetToken', value: ''} as any)
    const [isCharacterSelectWindowOpen, setIsCharacterSelectWindowOpen] = useState(false)
    const [isRoleSelectWindowOpen, setIsRoleSelectWindowOpen] = useState(false)
    const selectedCharacter = useCharacterStore(state => state.selectedCharacter)
    const setSelectedCharacter = useCharacterStore(state => state.setSelectedCharacter)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const {supabase, loading: isSessionLoading, session} = useSession()
    const router = useRouter()

    useEffect(() => {
        setToken({name: 'bnetToken', value: sessionStorage.getItem('bnetToken') || ''})
    }, [])

    useEffect(() => {
        if (!selectedCharacter) return
        if (isRoleSelectWindowOpen) return
        if (!selectedCharacter.selectedRole && session?.id === selectedCharacter.id && selectedCharacter?.id) return setIsRoleSelectWindowOpen(true)
        setIsRoleSelectWindowOpen(false)
        router.refresh()
    }, [selectedCharacter, session])

    if (isSessionLoading || !selectedCharacter || !supabase) {
        return <div
            className="px-1 py-2 lg:px-2 lg:py-1 flex flex-col items-center rounded-xl hover:cursor-pointer hover:bg-white hover:bg-opacity-20 hover:backdrop-filter hover:backdrop-blur-md h-[68px] w-[68px]"
        >
            <Spinner color={'success'}/>
        </div>
    }

    return (<>
        <Popover isOpen={popoverOpen} onOpenChange={(open) => setPopoverOpen(open)}>
            <PopoverTrigger>
                <div
                    className="px-1 py-2 lg:px-2 lg:py-1 flex flex-col items-center rounded-xl hover:cursor-pointer hover:bg-white hover:bg-opacity-20 hover:backdrop-filter hover:backdrop-blur-md"
                >
                    <CharacterAvatar
                        characterName={selectedCharacter.name}
                        realm={selectedCharacter.realm.slug}
                        className="rounded-full w-9 h-9 border border-gold"
                        role={selectedCharacter?.selectedRole}
                    />
                    <span>{selectedCharacter.name}</span>
                </div>
            </PopoverTrigger>
            <PopoverContent className="bg-wood">
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
                        text={'Select your role'}
                        onClick={() => {
                            setIsRoleSelectWindowOpen(true)
                            setPopoverOpen(false)
                        }}
                        icon={selectedCharacter && selectedCharacter.selectedRole ? getRoleIcon(selectedCharacter.selectedRole) : faPersonCircleQuestion}
                    />
                    <MenuItem text={'My armory'} onClick={
                        () => {
                            window.location.href = `/roster/${selectedCharacter.name.toLowerCase()}`
                        }
                    } icon={faUser}/>
                    <MenuItem text={'Logout'} onClick={logout} icon={faRightFromBracket}/>
                </div>
            </PopoverContent>
        </Popover>
        <BattleNetAuthManagerWindow
            token={token}
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
                <ModalBody>
                    {isSessionLoading ? <div>Loading...</div> :
                        <div className="flex flex-col gap-4">
                            {['Tank', 'Healer', 'Dps'].filter((role) => {
                                return isRoleAssignable(role.toLowerCase() as any, selectedCharacter.playable_class?.name?.toLowerCase())
                            }).map((role) => {
                                const roleKey = role.toLowerCase() as 'tank' | 'healer' | 'dps'
                                return (
                                    <div
                                        onClick={() => {
                                            supabase.from('ev_member')
                                                .select('character')
                                                .eq('id', selectedCharacter.id).single()
                                                .then(({data, error}: any) => {
                                                    if (error) {
                                                        console.error(error)
                                                        return
                                                    }
                                                    const {character} = data
                                                    supabase.from('ev_member').update({
                                                        character: {...character, selectedRole: roleKey}
                                                    }).eq('id', session?.id).single().then(({error}: any) => {
                                                        if (error) {
                                                            toast.error('Failed to update role', {
                                                                duration: 2500,
                                                                onDismiss: () => {
                                                                    clearAllCookies()
                                                                    window.location.reload()
                                                                },
                                                                onAutoClose: () => {
                                                                    clearAllCookies()
                                                                    window.location.reload()
                                                                }
                                                            })
                                                            return
                                                        }
                                                        setIsRoleSelectWindowOpen(false);
                                                        setSelectedCharacter({
                                                            ...selectedCharacter,
                                                            selectedRole: roleKey
                                                        })
                                                        router.refresh()
                                                    })
                                                })
                                        }}
                                        key={role}
                                        className={`flex gap-4 items-center justify-between hover:bg-gold hover:bg-opacity-20 py-2 px-4 rounded cursor-pointer`}>
                                        <div className={'flex gap-4 items-center'}>
                                            <img src={getRoleIcon(role)} alt={role}
                                                 className={`w-14 h-14 rounded-full border-gold border `}/>
                                            <div className={'flex flex-col gap-1'}>
                                                <h2 className={'text-gold font-bold text-xl'}>{role}</h2>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>}
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}
