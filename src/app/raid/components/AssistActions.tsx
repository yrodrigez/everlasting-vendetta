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
    Tooltip,
    useDisclosure
} from "@nextui-org/react";
import {useAssistanceStore} from "@/app/raid/components/assistanceStore";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowDown, faCheck, faClock} from "@fortawesome/free-solid-svg-icons";
import {ConfirmAssistance} from "@/app/raid/components/ConfirmAssistance";
import {LateAssistance} from "@/app/raid/components/LateAssistance";
import {TentativeAssistance} from "@/app/raid/components/TentativeAssistance";
import DeclineAssistance from "@/app/raid/components/DeclineAssistance";
import React, {useCallback, useEffect, useMemo} from "react";

import useScreenSize from "@/app/hooks/useScreenSize";
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
            onClick={onOpen}
            size="lg"
            className={`font-bold p-5 border border-transparent hover:border-gold hover:bg-dark`}
            startContent={<FontAwesomeIcon icon={faClock}/>}>
            Temporal login
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
                                Temporal login
                            </h1>
                        </ModalHeader>
                        <ModalBody>
                            <div>
                                You can login withouth a Battle.net account, just type the character name and select a
                                role.
                                <br/>
                                However, we recommend you to login with Battle.net to get the security provided by <Link
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
                                {isFetching ? 'Loading character...' : 'Login'}
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
                                          days = [WEEK_DAYS.WEDNESDAY, WEEK_DAYS.SATURDAY]
                                      }: {
    raidId: string,
    minLvl: number,
    endDate: string,
    participants: any[]
    hasLootReservations?: boolean
    days?: string[]
    endTime: string
}) {
    const {selectedCharacter, session, loading: isSessionLoading} = useSession()
    const selectedRole = selectedCharacter?.selectedRole
    const {addDay, removeDay, selectedDays, clearDays, setDays} = useAssistanceStore(state => state)

    useEffect(() => {
        const currentParticipant = (participants ?? []).find((p: any) => p?.member?.character?.name === selectedCharacter?.name)
        if (currentParticipant && currentParticipant.details?.days) {
            const selectedDays = currentParticipant.details.days
            clearDays()
            setDays(selectedDays)
        } else if (selectedDays.some((day: string) => days.indexOf(day) === -1)) {
            clearDays()
        }
    }, [selectedCharacter]);

    const {isMobile} = useScreenSize()

    if (moment.tz('Europe/Madrid').isAfter(moment(`${endDate} ${endTime === '00:00:00' ? '23:59:59' : endTime}`, 'YYYY-MM-DD HH:mm:ss').tz('Europe/Madrid'))) {
        return <div className="text-red-500 flex items-center min-h-20"></div>
    }

    if (isSessionLoading) {
        return <Spinner/>
    }

    if (!session) {
        return <div className="text-red-500 flex flex-col">
            Login to confirm your assistance
            <div
                className="flex gap-2"
            >
                <BnetLoginButton/>
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
            <Tooltip
                className="animate-blink-and-glow border-gold border rounded-lg p-4"
                content={
                    <div className="flex flex-col items-center justify-center gap-2 text-2xl">
                        <div>Select the days you can assist before continue</div>
                        <FontAwesomeIcon icon={faArrowDown} bounce className=""/>
                    </div>
                }

                placement={'top-start'}
                isOpen={!selectedDays || !selectedDays.length}
            >
                <div
                    className={
                        'grid gap-2 grid-cols-7 border-2 border-transparent rounded-lg p-1'
                        + ` ${selectedDays?.length === 0 ? ' border-red-500' : ''}`
                    }
                >
                    {days.map(day => {
                        return <Button
                            key={day}
                            isIconOnly={isMobile}
                            className={
                                'bg-red-400/80 text-red-800 rounded-full border border-red-900'
                                + ` ${selectedDays?.indexOf(day) !== -1 ? 'bg-green-500/80 text-green-900 border-green-900' : ''}`
                            }
                            onClick={() => {
                                if (selectedDays?.indexOf(day) !== -1) {
                                    removeDay(day)
                                } else {
                                    addDay(day)
                                }
                            }}
                            endContent={
                                isMobile || selectedDays?.indexOf(day) === -1 ? null : <CheckIcon/>
                            }
                        >{day}
                        </Button>
                    })}
                </div>
            </Tooltip>
        </div>
    )
}
