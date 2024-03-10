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
import ClassPicker from "@/app/components/ClassPicker";
import RolePicker from "@/app/components/RolePicker";
import {createClient} from '@supabase/supabase-js'
import Link from "next/link";

const supabaseUrl = 'https://ijzwizzfjawlixolcuia.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

function validateCharactersName(name: string) {
    // Check if the name meets the required length
    if (name.length < 2 || name.length > 12) {
        return false;
    }

    // Check if the name starts with a letter and contains only letters
    if (!/^[A-Za-z]+$/.test(name)) {
        return false;
    }

    // Verify that it doesn't have more than 4 consecutive consonants or 3 consecutive vowels
    return !/[^aeiouAEIOU]{5,}|[aeiouAEIOU]{4,}/.test(name);
}

async function onsubmit(state: any) {
    if (!state) return
    const healingClasses = ['priest', 'paladin', 'shaman', 'druid', 'mage']
    const tankClasses = ['warrior', 'paladin', 'druid', 'rogue', 'warlock']
    const dpsClasses = ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock']

    const role = state['role']
    const characterClass = state['class']
    if (role === 'healer' && !healingClasses.includes(characterClass)) {
        return {error: 'Invalid class for healer role'}

    }
    if (role === 'tank' && !tankClasses.includes(characterClass)) {
        return {error: 'Invalid class for tank role'}
    }
    if (role === 'dps' && !dpsClasses.includes(characterClass)) {
        return {error: 'Invalid class for dps role'}
    }

    if (!validateCharactersName(state.characterName)) {
        return {error: 'Invalid character name'}
    }


    const supabase = createClient(supabaseUrl, supabaseKey)
    const response = await supabase.from('ev_application').insert({
        name: state.characterName,
        ...(state.email ? {email: state.email} : {}),
        class: state.class,
        role: state.role,
        message: state.message || ''
    })

    if (response.error) {
        return {error: 'Error submitting application please try again with other character\'s name or email.'}
    }

    return {error: null}
}


export default function ApplyForm() {
    const [form, setForm] = useState({
        characterName: '',
        email: '',
        class: '',
        role: '',
        message: '',
    });
    const [isFormDisabled, setIsFormDisabled] = useState(true);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [modalContent, setModalContent] = useState({
        title: '',
        body: '',
        footer: ''
    } as any);
    useEffect(() => {
        if (form.characterName && form.class && form.role) {
            setIsFormDisabled(false)
        } else {
            setIsFormDisabled(true)
        }
    }, [form]);

    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Input
                    onChange={(e) => setForm({...form, characterName: e.target.value})}
                    label="Character's name *" id="character-name" required/>
            </div>
            <div className="grid gap-2">
                <Input
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    label="Email" id="email" type="email"/>
            </div>
            <div className="grid gap-2">
                <ClassPicker
                    setForm={setForm}
                />
            </div>
            <div className="grid gap-2">
                <RolePicker
                    setForm={setForm}
                />
            </div>
            <div className="grid gap-2">
                <Textarea
                    onChange={(e) => setForm({...form, message: e.target.value})}
                    id="message" placeholder="Enter your message"/>
            </div>
            <div className="flex items-center">
                <Button onClick={() => {
                    onsubmit(form).then((response) => {
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
                                    <p>You can reach out to any of our officers: <Link
                                        href={'/roster/alveric'}>Alveric</Link> or <Link
                                        href={'/roster/nivlor'}>Nivlor</Link></p>
                                    <p>Good luck!</p>
                                </>),
                                footer: ''
                            })
                            onOpen()
                        }
                    })

                }} disabled={isFormDisabled} className="bg-moss text-gold w-full font-bold"
                        type="submit">
                    Submit Application
                </Button>
            </div>
            <Modal isOpen={isOpen} size="xs" onOpenChange={onOpenChange} backdrop="blur" onClose={()=>{
                window?.location?.reload()
            }}>
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
