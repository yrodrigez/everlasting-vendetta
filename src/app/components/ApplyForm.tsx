"use client"
import {useEffect, useState} from "react";
import {Input, Textarea, Button} from "@nextui-org/react";
import ClassPicker from "@/app/components/ClassPicker";
import RolePicker from "@/app/components/RolePicker";
import {createClient} from '@supabase/supabase-js'

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

function onsubmit(state: any, setForm: any) {
    if (!state) return
    const healingClasses = ['priest', 'paladin', 'shaman', 'druid', 'mage']
    const tankClasses = ['warrior', 'paladin', 'druid', 'rogue', 'warlock']
    const dpsClasses = ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock']

    const role = state['role']
    const characterClass = state['class']
    if (role === 'healer' && !healingClasses.includes(characterClass)) {
        alert('Invalid class for healer role')
        return
    }
    if (role === 'tank' && !tankClasses.includes(characterClass)) {
        alert('Invalid class for tank role')
        return
    }
    if (role === 'dps' && !dpsClasses.includes(characterClass)) {
        alert('Invalid class for dps role')
        return
    }

    if (!validateCharactersName(state.characterName)) {
        alert('Invalid character name')
        return
    }


    const supabase = createClient(supabaseUrl, supabaseKey)
    supabase.from('ev_application').insert({
        name: state.characterName,
        email: state.email || '',
        class: state.class,
        role: state.role,
        message: state.message || ''
    }).then(({error}) => {
        if (!error) {
            alert('Application submitted')
            setForm({
                characterName: '',
                email: '',
                class: '',
                role: '',
                message: '',
            })
            window?.location?.reload()
        } else {
            alert('Error submitting application please try again with other character\'s name or email.')
        }
    })
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
                <Button onClick={()=>{
                    onsubmit(form, setForm)
                }} disabled={isFormDisabled} className="bg-moss text-gold w-full font-bold"
                        type="submit">
                    Submit Application
                </Button>
            </div>
        </div>
    )
}
