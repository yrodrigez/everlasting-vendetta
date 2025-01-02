"use client"
import {useEffect, useState} from "react";
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
} from "@nextui-org/react";
import LookupField from "@/app/components/LookupField";
import Link from "next/link";
import {onForm, getClassIcon, getRoleIcon} from "@/app/apply/components/utils";
import {useApplyFormStore} from "@/app/apply/components/store";
import {CharacterNameInput} from "@/app/apply/components/CharacterNameInput";


export default function ApplyForm() {

    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [modalContent, setModalContent] = useState({
        title: '',
        body: '',
        footer: ''
    } as any);


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

    return (
        <div className="space-y-4">
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
                <LookupField
                    title="Role"
                    value={characterRole}
                    onChange={(selectedValue: string) => selectedValue !== 'Role' && setRole(selectedValue)}
                    values={new Set([
                        'Healer',
                        'Tank',
                        'DPS'
                    ])}
                    icon={(characterRole && characterRole !== 'Role') ? getRoleIcon(characterRole) : ''}
                />
            </div>
            <div className="grid gap-2">
                <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
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
                                    <p>You can reach out to any of our officers: <Link className={'text-gold'}
                                                                                       href={'/roster/alveric'}>Alveric</Link> or <Link
                                        className={'text-gold'}
                                        href={'/roster/porco'}>Porco</Link></p>
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
