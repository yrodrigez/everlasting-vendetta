"use client"
import React, {useEffect, useMemo, useState} from "react";
import {
    Input,
    Textarea,
    Button,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Modal,
    useDisclosure
} from "@heroui/react";
import LookupField from "@/app/components/LookupField";
import Link from "next/link";
import {onForm, getClassIcon, getRoleIcon} from "@/app/apply/components/utils";
import {useApplyFormStore} from "@/app/apply/components/store";
import {CharacterNameInput} from "@/app/apply/components/CharacterNameInput";
import {PLAYABLE_ROLES} from "@/app/util/constants";
import {isRoleAssignable} from "@/app/components/ProfileManager";


export default function ApplyForm() {

    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [modalContent, setModalContent] = useState({
        title: '',
        body: '',
        footer: ''
    } as any);

    const contactWith = [
        'Alveric',
        'Felsargon',
        'Utrivelig',
        'Templaari',
    ]

    const name = useApplyFormStore(state => state.name)
    const email = useApplyFormStore(state => state.email)
    const message = useApplyFormStore(state => state.message)
    const characterClass = useApplyFormStore(state => state.characterClass)
    const characterRole = useApplyFormStore(state => state.characterRole)
    const isFormDisabled = useApplyFormStore(state => state.isFormDisabled)
    const characterExists = useApplyFormStore(state => state.characterExists)
    //get functions in one line
    const {
        setIsFormDisabled,
        setEmail,
        setMessage,
        setClass,
        setRole,
        reset: resetForm,
    } = useApplyFormStore()


    useEffect(() => {
        setIsFormDisabled(!(name && characterClass && characterRole && characterExists))
    }, [name, characterClass, characterRole, characterExists])

    const assignableRoles = useMemo(() => {
        return Object.values(PLAYABLE_ROLES).filter(role => role.value.split('-').every((x: string) => isRoleAssignable(x.toLowerCase(), characterClass?.toLowerCase())))
    }, [characterClass, name])

    return (
        <div className="space-y-4 lg:w-[300px] w-[450px]">
            <div className="grid gap-2">
                <CharacterNameInput/>
            </div>
            <div className="grid gap-2">
                <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    label="Email" id="email" type="email"/>
            </div>
            <div className="grid gap-2">
                <LookupField
                    title="Class"
                    value={characterClass}
                    onChange={(selectedValue: string) => selectedValue !== 'Class' && setClass(selectedValue)}
                    values={new Set([
                        'Warrior',
                        'Paladin',
                        'Hunter',
                        'Rogue',
                        'Priest',
                        'Mage',
                        'Warlock',
                        'Druid'
                    ])}
                    icon={(characterClass && characterClass !== 'Class') ? getClassIcon(characterClass) : ''}
                />
            </div>
            <div className="grid gap-2">
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
                                        if (characterRole !== role.value) setRole(role.value)
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
            <div className="grid gap-2">
                <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={20}
                    id="message" placeholder="Enter your message"/>
            </div>
            <div className="flex items-center">
                <Button isDisabled={isFormDisabled} onPress={() => {
                    onForm({name, email, characterRole, characterClass, message}).then((response) => {
                        if (response?.error) {
                            setModalContent({
                                title: (
                                    <p className="text-red-700 font-bold text-2xl">Error</p>
                                ),
                                body: response.error,
                                footer: ''
                            })
                            onOpen()
                        } else {
                            const audio = new Audio('/sounds/levelup2.ogg');
                            audio.play().then().catch(console.error)
                            setModalContent({
                                title: (
                                    <p className="text-gold font-bold text-2xl">Application Submitted</p>
                                ),
                                body: (<>
                                    <p>Your application has been submitted successfully.</p>
                                    <p>Thank you for applying to our guild.</p>
                                    <p>In the meantime, you can contact us in game to speed up the process.</p>
                                    <p>You can reach out to any of our officers: {contactWith.map(((x, i) => {
                                        return <span key={x}><Link className={'text-gold'}
                                                                   href={`/roster/${x.toLowerCase()}`}>{x}</Link>{i === contactWith.length - 1 ? '' : i === contactWith.length - 2 ? ' or ' : ', '}</span>
                                    }))}</p>
                                    <p>Good luck!</p>
                                </>),
                                footer: ''
                            })
                            resetForm()
                            onOpen()
                        }
                    })

                }} className="bg-moss text-gold w-full font-bold"
                        type="submit">
                    Submit Application
                </Button>
            </div>
            <Modal placement="center" isOpen={isOpen} size="xs" onOpenChange={onOpenChange} backdrop="blur">
                <ModalContent className={
                    `bg-wood ${!modalContent.title ? 'pt-4' : ''} ${!modalContent.footer ? 'pb-4' : ''}`
                }>
                    {() => (
                        <>
                            {modalContent.title &&
                                <ModalHeader className="flex flex-col gap-1">{modalContent.title}</ModalHeader>}
                            <ModalBody>
                                {modalContent.body}
                            </ModalBody>
                            {modalContent.footer && <ModalFooter> {modalContent.footer}</ModalFooter>}
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    )
}
