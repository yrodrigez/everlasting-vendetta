'use client'
import moment from "moment-timezone"

import {useSession} from "@/app/hooks/useSession";
import {
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    useDisclosure
} from "@heroui/react";
import {useAssistanceStore} from "@/app/raid/components/assistanceStore";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChair, faCheck, faUser} from "@fortawesome/free-solid-svg-icons";
import {ConfirmAssistance} from "@/app/raid/components/ConfirmAssistance";
import {LateAssistance} from "@/app/raid/components/LateAssistance";
import {TentativeAssistance} from "@/app/raid/components/TentativeAssistance";
import DeclineAssistance from "@/app/raid/components/DeclineAssistance";
import React, {useCallback, useEffect, useMemo} from "react";
import {BnetLoginButton} from "@/app/components/BnetLoginButton";
import {Button} from "@/app/components/Button";

import Link from "next/link";
import {useQuery} from "@tanstack/react-query";
import {fetchCharacterByName} from "@/app/raid/[id]/soft-reserv/ReserveForOthers";
import LookupField from "@/app/components/LookupField";
import {getRoleIcon} from "@/app/apply/components/utils";
import {BnetCharacterResponse} from "@/app/types/BnetCharacterResponse";
import {Character, useCharacterStore} from "@/app/components/characterStore";
import {CharacterRoleType} from "@/app/types/CharacterRole";
import {useRouter} from "next/navigation";
import {performTemporalLogin} from "@/app/hooks/SessionManager";
import {toast} from "sonner";
import {RAID_STATUS} from "@/app/raid/components/utils";

export const WEEK_DAYS = {
    MONDAY: 'Mon',
    TUESDAY: 'Tue',
    WEDNESDAY: 'Wed',
    THURSDAY: 'Thu',
    FRIDAY: 'Fri',
    SATURDAY: 'Sat',
    SUNDAY: 'Sun',
}

function createTemporalLoginPayload(character: BnetCharacterResponse, role: CharacterRoleType): Character {
    return {
        id: character.id,
        name: character.name,
        level: character.level,
        avatar: character.avatar,
        realm: {
            slug: character.realm.slug
        },
        selectedRole: role,
        playable_class: {
            name: character.character_class.name
        },
        isTemporal: true
    }
}

export const CheckIcon = ({className}: { className?: string }) => {
    return <FontAwesomeIcon icon={faCheck} className={className}/>
}

export function TemporalLogin() {
    const {isOpen, onOpen, onClose} = useDisclosure()
    const [characterName, setCharacterName] = React.useState<string>()
    const [_, setIsWriting] = React.useState(false)
    const timoutRef = React.useRef<any>()
    const lowerCaseCharacterName = useMemo(() => characterName?.toLowerCase(), [characterName])
    const [characterRole, setRole] = React.useState<CharacterRoleType>('dps')
    const [isLogging, setIsLogging] = React.useState<boolean>(false)

    const router = useRouter()

    const {
        setCharacters,
        setSelectedCharacter
    } = useCharacterStore(state => ({
        setCharacters: state.setCharacters,
        setSelectedCharacter: state.setSelectedCharacter
    }))

    const {data: character, isLoading, isFetching} = useQuery({
        queryKey: ['character', lowerCaseCharacterName],
        queryFn: async () => {
            if (!lowerCaseCharacterName) {
                return undefined
            }

            const character = await fetchCharacterByName(lowerCaseCharacterName, 'temporal')
            if (!character) {
                return undefined
            }

            if (character.faction.type.toLowerCase() !== 'alliance') {
                return undefined
            }

            return character
        },
        enabled: !!lowerCaseCharacterName && !!characterRole,
    })

    const setIntoStore = useCallback(async () => {
        if (character && characterRole) {
            setIsLogging(true)
            const {error, ok} = await performTemporalLogin(character)
            if (!ok) {
                toast.error(`Failed to install session: ${error}`, {
                    duration: 2500,
                    onDismiss: () => {
                        setCharacterName('')
                        setRole('dps')
                    },
                    onAutoClose: () => {
                        setCharacterName('')
                        setRole('dps')
                    },
                })
                console.error(error)
                setIsLogging(false)
                return
            }

            setCharacters([createTemporalLoginPayload(character, characterRole)])
            setSelectedCharacter(createTemporalLoginPayload(character, characterRole))
            setIsLogging(false)
            onClose()
            router.refresh()
        }
    }, [character])


    return <>
        <Button
            onPress={onOpen}
            size="lg"
            className={`font-bold p-5 border border-moss-100 hover:border-gold hover:bg-dark rounded-lg`}
            startContent={<FontAwesomeIcon icon={faUser}/>}>
            Login with char name
        </Button>
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            isDismissable={false}
            size={'lg'}
            placement="center"
            scrollBehavior="inside"
            className="border border-gold scrollbar-pill"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            <h1 className="text-2xl font-bold text-center">
                                Login with character name
                            </h1>
                        </ModalHeader>
                        <ModalBody>
                            <div>
                                You can login without a Battle.net account, just type the character name and select a
                                role.
                                <br/>
                                <br/>
                                However, we recommend you to login with Battle.net to get the security provided by
                                the <Link
                                href={'https://develop.battle.net/documentation/guides/using-oauth'} target={'_blank'}
                                className="text-battlenet">battle.net API</Link>.
                            </div>
                            <Input
                                label="Character name"
                                value={characterName}
                                onFocus={() => setIsWriting(true)}
                                onChange={(e) => {
                                    setIsWriting(true)
                                    setCharacterName(e.target.value)
                                    if (timoutRef.current) {
                                        clearTimeout(timoutRef.current)
                                    }
                                    // @ts-ignore
                                    timoutRef.current = setTimeout(() => {
                                        setIsWriting(false)
                                    }, 2000)
                                }}
                                onBlur={() => setIsWriting(false)}
                            />
                            <div>
                                {characterName && !character?.name && (<span>Character not found</span>)}
                                {character?.name && (
                                    <div className="flex flex-col gap-2 justify-center w-full">
                                        <div className="flex w-full items-center justify-center">
                                            <div className="w-64">
                                                <LookupField
                                                    title="Role"
                                                    value={characterRole}
                                                    onChange={(selectedValue: string) => {
                                                        setRole(selectedValue as CharacterRoleType)
                                                    }}
                                                    values={new Set([
                                                        'Healer',
                                                        'Tank',
                                                        'DPS'
                                                    ])}
                                                    icon={(characterRole && characterRole) ? getRoleIcon(characterRole) : ''}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <img src={character.avatar} alt={character.name}
                                                 className="rounded-full w-20 h-20"/>
                                            <div className="flex flex-col gap-2">
                                                <Link
                                                    className={'text-gold underline'}
                                                    target={'_blank'}
                                                    href={`/roster/${lowerCaseCharacterName}`}>
                                                    <span>{character.name} ({character.level})</span>
                                                </Link>
                                                <span>Class: {character.character_class?.name}</span>
                                                <span>Guild: {character.guild?.name ?? 'No guild, Invite this guy'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                isLoading={isLoading || isLogging}
                                isDisabled={!character?.name || !characterRole || isLoading}
                                onClick={setIntoStore}
                                className={'bg-moss text-default rounded'}
                            >
                                {isFetching ? 'Loading character...' : 'Select'}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    </>
}

export default function AssistActions({
                                          raidId,
                                          minLvl,
                                          endDate,
                                          participants,
                                          hasLootReservations = false,
                                          endTime,
                                          days = [WEEK_DAYS.WEDNESDAY, WEEK_DAYS.SATURDAY],
    status
                                      }: {
    raidId: string,
    minLvl: number,
    endDate: string,
    participants: any[]
    hasLootReservations?: boolean
    days?: string[]
    endTime: string
    status?: 'online' | 'offline'
}) {
    const {selectedCharacter, session, loading: isSessionLoading} = useSession()
    const selectedRole = selectedCharacter?.selectedRole
    const {setDays} = useAssistanceStore(state => state)

    const [bounce, setBounce] = React.useState(false)

    useEffect(() => {
        setDays(days)
        setBounce(true)
        setTimeout(() => {
            setBounce(false)
        }, 2300)
    }, [selectedCharacter]);

    if(status === 'offline') {
        return <div className="text-red-500">Raid is Cancelled!</div>
    }

    if (moment.tz('Europe/Madrid').isAfter(moment(`${endDate} ${endTime === '00:00:00' ? '23:59:59' : endTime}`, 'YYYY-MM-DD HH:mm:ss').tz('Europe/Madrid'))) {
        return <div className="text-red-500 flex items-center min-h-7"></div>
    }

    if (isSessionLoading) {
        return <Spinner/>
    }

    if (!session) {
        return <div className="text-red-500 flex flex-col mb-2">
            Login to confirm
            <div
                className="flex gap-2 items-center justify-center"
            >
                <BnetLoginButton/>
                <span className="text-default"> - or - </span>
                <TemporalLogin/>
            </div>
        </div>
    }

    if (!selectedRole) {
        return <div className="text-red-500">Select a role first</div>

    }

    if ((selectedCharacter?.level ?? 0) < minLvl) {
        return <div className="text-red-500">You must be at least level {minLvl} to assist</div>
    }

    if (participants.find(p => p.member.id === session.id && p.details.status === RAID_STATUS.BENCH)) {
        return <div className="text-orange-400 flex gap-2">
            <FontAwesomeIcon icon={faChair}
                             bounce={bounce}
            />
            You are benched</div>
    }

    return (
        <div className={'grid gap-2'}>
            <div className={'flex gap-2 flex-wrap max-w-[500px]'}>
                <ConfirmAssistance
                    hasLootReservations={hasLootReservations}
                    raidId={raidId}/>
                <LateAssistance
                    hasLootReservations={hasLootReservations}
                    raidId={raidId}/>
                <TentativeAssistance
                    hasLootReservations={hasLootReservations}
                    raidId={raidId}/>
                <DeclineAssistance raidId={raidId}/>
            </div>
        </div>
    )
}
