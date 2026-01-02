"use client";

import {
    Card,
    CardBody,
    CardHeader,
} from "@/app/components/card";
import {
    Divider
} from "@heroui/react";
import { LinkedAccounts } from "./components/linked-accounts";
import { LinkedAccount } from "./components/linked-accounts/types";
import { CharacterCard } from "./components/characters";
import { Character } from "./components/characters/types";


export default function ProfilePage({ characters, accounts }: { characters: Character[]; accounts: LinkedAccount[] }) {

    return (
        <div className="min-h-screen p-4 md:p-8">
            <Card className="max-w-4xl mx-auto bg-wood-900 border border-wood-100">
                <CardHeader className="flex justify-between items-center px-6 py-4 bg-wood border-b border-wood-100">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl md:text-2xl font-bold text-gold">MY PROFILE (under construction)</h1>
                    </div>
                </CardHeader>

                <CardBody className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        {/*  {/* Top Section: 3D Viewer + Linked Accounts 
                    
                        {/* 3D Model Viewer Placeholder 
                        <Card className="bg-dark border border-wood-100">
                            <CardBody className="flex flex-col items-center justify-center min-h-[280px]">
                                <div className={`w-32 h-32 rounded-full bg-${selectedColorClass} bg-opacity-20 border-2 border-${selectedColorClass} flex items-center justify-center mb-4`}>
                                    <span className={`text-${selectedColorClass} text-4xl font-bold`}>
                                        {selectedCharacter?.name.charAt(0) || "?"}
                                    </span>
                                </div>
                                <p className="text-stone text-sm">[3D Model Viewer]</p>
                                <p className="text-stone-100 text-xs mt-1">selected character</p>
                                {selectedCharacter && (
                                    <p className={`text-${selectedColorClass} font-semibold mt-2`}>
                                        {selectedCharacter.name}
                                    </p>
                                )}
                            </CardBody>
                        </Card> */}

                        {/* Linked Accounts */}
                        <LinkedAccounts accounts={accounts} />
                    </div>

                    <Divider className="bg-wood-100" />

                    {/* Characters Section */}
                    <Card className="bg-dark border border-wood-100">
                        <CardHeader className="px-4 py-3 border-b border-wood-100">
                            <div className="flex items-center gap-2">
                                <h2 className="text-primary font-semibold">MY CHARACTERS</h2>
                            </div>
                        </CardHeader>
                        <CardBody className="p-4">
                            <div className="flex flex-wrap gap-4">
                                {characters.map((character) => (
                                    <CharacterCard
                                        key={character.id}
                                        character={character}
                                        isSelected={false}
                                        onSelect={() => { }}
                                    />
                                ))}
                            </div>
                        </CardBody>
                    </Card>
{/* 
                    <Divider className="bg-wood-100" /> */}

                    {/* Privacy Settings */}
                    {/*
                    <Card className="bg-dark border border-wood-100">
                        <CardHeader className="px-4 py-3 border-b border-wood-100">
                            <div className="flex items-center gap-2">
                                <h2 className="text-primary font-semibold">Privacy Settings</h2>
                            </div>
                        </CardHeader>
                        <CardBody className="p-4 space-y-4">
                            {/* Character Selector 
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                <label className="text-stone-100 text-sm whitespace-nowrap">
                                    My selected character:
                                </label>
                                <Select
                                    selectedKeys={[selectedCharacterId]}
                                    onChange={(e) => setSelectedCharacterId(e.target.value)}
                                    className="max-w-xs"
                                    classNames={{
                                        trigger: "bg-wood border-wood-100",
                                        value: "text-primary",
                                    }}
                                    aria-label="Select character"
                                >
                                    {characters.map((char) => (
                                        <SelectItem key={char.id} textValue={char.name}>
                                            <span className={`text-${classColors[char.class]}`}>
                                                {char.name} - {char.class.charAt(0).toUpperCase() + char.class.slice(1)} (Lvl {char.level})
                                            </span>
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>

                            {/* Checkboxes 
                            <div className="space-y-3">
                                <Checkbox
                                    isSelected={privacySettings.showBattleTag}
                                    onValueChange={(checked) =>
                                        setPrivacySettings(prev => ({ ...prev, showBattleTag: checked }))
                                    }
                                    classNames={{
                                        label: "text-stone-100 text-sm",
                                    }}
                                >
                                    Show my battle tag
                                </Checkbox>

                                <Checkbox
                                    isSelected={privacySettings.showDiscord}
                                    onValueChange={(checked) =>
                                        setPrivacySettings(prev => ({ ...prev, showDiscord: checked }))
                                    }
                                    classNames={{
                                        label: "text-stone-100 text-sm",
                                    }}
                                >
                                    Show my Discord username
                                </Checkbox>
                            </div>

                            {/* Visibility Selector
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                <label className="text-stone-100 text-sm whitespace-nowrap">
                                    Profile visibility:
                                </label>
                                <Select
                                    selectedKeys={[privacySettings.visibility]}
                                    onChange={(e) =>
                                        setPrivacySettings(prev => ({ ...prev, visibility: e.target.value }))
                                    }
                                    className="max-w-xs"
                                    classNames={{
                                        trigger: "bg-wood border-wood-100",
                                        value: "text-primary",
                                    }}
                                    aria-label="Profile visibility"
                                >
                                    <SelectItem key="private" textValue="Private">
                                        🔒 Private
                                    </SelectItem>
                                    <SelectItem key="guild" textValue="Guild only">
                                        👥 Guild only
                                    </SelectItem>
                                    <SelectItem key="public" textValue="Public">
                                        🌐 Public
                                    </SelectItem>
                                </Select>
                            </div>
                        </CardBody>
                    </Card> */}
                </CardBody>
            </Card>
        </div>
    );
}