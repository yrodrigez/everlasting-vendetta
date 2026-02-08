"use client"
import { CharacterNameInput } from "@/app/apply/components/CharacterNameInput";
import { useApplyFormStore } from "@/app/apply/components/store";
import { getClassIcon, getRoleIcon, onForm } from "@/app/apply/components/utils";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/input";
import LookupField from "@/app/components/LookupField";
import { isRoleAssignable } from "@/app/components/ProfileManager";
import { Textarea } from "@/app/components/text-area";
import { PLAYABLE_ROLES } from "@/app/util/constants";
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    SelectItem,
    useDisclosure
} from "@heroui/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { RealmSelection } from "@/app/components/realm-selection";
import { Select } from "@/app/components/select";


export default function ApplyForm() {

    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [modalContent, setModalContent] = useState({
        title: '',
        body: '',
        footer: ''
    } as any);

    const contactWith = [
        'Alveric',
        'Felsargon',
        'Templaari',
        'Mephius'
    ]

    const allowedRealms = [
        { label: 'Living Flame', slug: 'living-flame' },
        { label: 'Spineshatter', slug: 'spineshatter' }
    ]

    const name = useApplyFormStore(state => state.name)
    const email = useApplyFormStore(state => state.email)
    const message = useApplyFormStore(state => state.message)
    const characterClass = useApplyFormStore(state => state.characterClass)
    const characterRole = useApplyFormStore(state => state.characterRole)
    const isFormDisabled = useApplyFormStore(state => state.isFormDisabled)
    const characterExists = useApplyFormStore(state => state.characterExists)
    const realm = useApplyFormStore(state => state.realm)
    const setRealm = useApplyFormStore(state => state.setRealm)
    //get functions in one line
    const {
        setIsFormDisabled,
        setEmail,
        setMessage,
        setClass,
        setRole,
        reset: resetForm,
    } = useApplyFormStore(useShallow(state => ({
        setIsFormDisabled: state.setIsFormDisabled,
        setEmail: state.setEmail,
        setMessage: state.setMessage,
        setClass: state.setClass,
        setRole: state.setRole,
        reset: state.reset
    })))


    useEffect(() => {
        setIsFormDisabled(!(name && characterClass && characterRole && characterExists))
    }, [name, characterClass, characterRole, characterExists])

    const assignableRoles = useMemo(() => {
        return Object.values(PLAYABLE_ROLES).filter(role => role.value.split('-').every((x: string) => isRoleAssignable(x.toLowerCase(), characterClass?.toLowerCase(), realm)))
    }, [characterClass, name, realm])

    return (
        <div className="space-y-4 lg:w-[300px] w-[450px]">
            <div className="grid gap-2">
                <RealmSelection
                    realm={realm}
                    onRealmChange={(newRealm) => setRealm(newRealm)}
                />
            </div>
            <div className="grid gap-2">
                <CharacterNameInput isDisabled={!realm} />
            </div>
            <div className="grid gap-2">
                <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    label="Email" id="email" type="email" />
            </div>
            <div className="grid gap-2">
                <Select
                    label="Class"
                    placeholder="Select your class"
                    className="w-full"
                    endContent={characterClass && (<img
                        className={`
                                min-w-6 h-6
                                rounded-full
                                border border-${characterClass?.toLowerCase()}
                            `}
                        src={getClassIcon(characterClass)}
                        alt={characterClass}
                    />)}
                    selectionMode="single"
                    selectedKeys={characterClass ? [characterClass] : []}
                    onChange={({ target }) => {
                        setClass(target.value)
                    }}
                >
                    {[
                        'Warrior',
                        'Paladin',
                        'Hunter',
                        'Rogue',
                        'Priest',
                        'Mage',
                        'Warlock',
                        'Druid',
                        'Shaman',
                    ].map((cls) => (
                        <SelectItem
                            key={cls}
                            endContent={<img
                                className={`
                                        w-6 h-6
                                        rounded-full
                                        border border-${cls.toLowerCase()}
                                    `}
                                src={getClassIcon(cls)}
                                alt={cls}
                            />}
                        >{cls}</SelectItem>
                    ))}
                </Select>
            </div>
            <div className="grid gap-2">
                <div
                    className="flex gap-2 p-2 w-full flex-wrap justify-center items-center">
                    {Object.values(PLAYABLE_ROLES).map(
                        (role, i) => {
                            const isDisabled = assignableRoles.findIndex(r => r.value === role.value) === -1;
                            return (
                                <Button
                                    key={i}

                                    isDisabled={isDisabled}
                                    className={
                                        `bg-moss opacity-100 text-gold rounded border border-moss-100 relative hover:bg-dark hover:border-dark-100 `
                                        + ` ${characterRole === role.value ? 'bg-dark text-gold border-gold' : ''}`
                                        + ` ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`
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
                    id="message"
                    placeholder="Why do you want to join Everlasting Vendetta? Tell us about your WoW experience, what you enjoy doing, raid availability, and what kind of player you are..." />
            </div>
            <div className="flex items-center">
                <Button isDisabled={isFormDisabled} onPress={() => {
                    onForm({ name, email, characterRole, characterClass, message, realm }).then((response) => {
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
