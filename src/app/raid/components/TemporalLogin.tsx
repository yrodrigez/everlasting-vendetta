'use client'
import {Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@heroui/react";
import React, {useCallback, useMemo} from "react";
import {CharacterRoleType} from "@/app/types/CharacterRole";
import {useRouter} from "next/navigation";
import {Character, useCharacterStore} from "@/app/components/characterStore";
import {useQuery} from "@tanstack/react-query";
import {BnetCharacterResponse, createEmptyBnetCharacterResponse} from "@/app/types/BnetCharacterResponse";
import {fetchCharacterByName} from "@/app/raid/[id]/soft-reserv/ReserveForOthers";
import {PLAYABLE_ROLES} from "@utils/constants";
import {isRoleAssignable} from "@/app/components/ProfileManager";
import {performTemporalLogin} from "@hooks/SessionManager";
import {toast} from "sonner";
import {Button} from "@/app/components/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUser} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import {getRoleIcon} from "@/app/apply/components/utils";
import {useShallow} from "zustand/react/shallow";

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
    } = useCharacterStore(useShallow(state => ({
        setCharacters: state.setCharacters,
        setSelectedCharacter: state.setSelectedCharacter
    })))

    const {data: character, isLoading, isFetching} = useQuery({
        queryKey: ['character', lowerCaseCharacterName],
        queryFn: async () => {
            if (!lowerCaseCharacterName) {
                return createEmptyBnetCharacterResponse()
            }

            const character = await fetchCharacterByName(lowerCaseCharacterName, 'temporal')
            if (!character) {
                return createEmptyBnetCharacterResponse()
            }

            if (character.faction.type.toLowerCase() !== 'alliance') {
                return createEmptyBnetCharacterResponse()
            }

            return character
        },
        enabled: !!lowerCaseCharacterName && !!characterRole,
    })
    const assignableRoles = useMemo(() => {
        return Object.values(PLAYABLE_ROLES).filter(role => role.value.split('-').every((x: string) => isRoleAssignable(x.toLowerCase(), character?.character_class?.name?.toLowerCase())))
    }, [character, character?.character_class?.name, character?.name])

    const setIntoStore = useCallback(async () => {
        if (character && character?.id !== 0 && characterRole) {
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
                {() => (
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
                                            <div className="w-full">
                                                <div
                                                    className="flex gap-2 p-2 w-full flex-wrap justify-center items-center">
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
                                                                        + ` ${characterRole === role.value ? 'bg-dark text-gold border-gold' : ''}`
                                                                    }
                                                                    onPress={() => {
                                                                        if (characterRole !== role.value) setRole(role.value as CharacterRoleType)
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
                                                {character.guild?.name ? (
                                                    <span>Guild: {character.guild?.name}</span>
                                                ) : (
                                                    <span className="text-default">
                                                        We've noticed that you are not in a guild, would you like to &nbsp;
                                                        <Link
                                                            className={'text-gold underline'}
                                                            target={'_blank'}
                                                            href={`/apply`}>
                                                            apply to our guild?
                                                        </Link>
                                                    </span>
                                                )}
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