type DruidTalents = {
    Balance: TalentsPlaceholder,
    FeralCombat: TalentsPlaceholder,
    Restoration: TalentsPlaceholder,
}
type HunterTalents = {
    BeastMastery: TalentsPlaceholder,
    Marksmanship: TalentsPlaceholder,
    Survival: TalentsPlaceholder,
}
type MageTalents = {
    Arcane: TalentsPlaceholder,
    Fire: TalentsPlaceholder,
    Frost: TalentsPlaceholder,
}
type PaladinTalents = {
    Holy: TalentsPlaceholder,
    Protection: TalentsPlaceholder,
    Retribution: TalentsPlaceholder,
}
type PriestTalents = {
    Discipline: TalentsPlaceholder,
    Holy: TalentsPlaceholder,
    Shadow: TalentsPlaceholder,
}
type RogueTalents = {
    Assassination: TalentsPlaceholder,
    Combat: TalentsPlaceholder,
    Subtlety: TalentsPlaceholder,
}
type ShamanTalents = {
    Elemental: TalentsPlaceholder,
    Enhancement: TalentsPlaceholder,
    Restoration: TalentsPlaceholder,
}
type WarlockTalents = {
    Affliction: TalentsPlaceholder,
    Demonology: TalentsPlaceholder,
    Destruction: TalentsPlaceholder,
}
type WarriorTalents = {
    Arms: TalentsPlaceholder,
    Fury: TalentsPlaceholder,
    Protection: TalentsPlaceholder,
}
export type TalentsPlaceholders = {
    Druid: DruidTalents
    Hunter: HunterTalents
    Mage: MageTalents
    Paladin: PaladinTalents
    Priest: PriestTalents
    Rogue: RogueTalents
    Shaman: ShamanTalents
    Warlock: WarlockTalents
    Warrior: WarriorTalents
}

export type Talent = {
    skip: boolean
    src?: string
    name?: string
    maxPoints?: number
}
export type TalentsPlaceholder = {
    background: string
    talents: Talent[][]
}

export const talentsPlaceholders: TalentsPlaceholders = {
    Druid: {
        Balance: {
            background: '/talents-backgrounds/1.jpg',
            talents: [
                [
                    {skip: false, src: '/talents-icons/1.jpg', name: 'Improved Wrath', maxPoints: 5},
                    {skip: false, src: '/talents-icons/2.jpg', name: 'Nature\'s Grasp', maxPoints: 1},
                    {skip: false, src: '/talents-icons/3.jpg', name: 'Improved Nature\'s Grasp', maxPoints: 4},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/4.jpg', name: 'Improved Entangling Roots', maxPoints: 3},
                    {skip: false, src: '/talents-icons/5.jpg', name: 'Improved Moonfire', maxPoints: 5},
                    {skip: false, src: '/talents-icons/6.jpg', name: 'Natural Weapons', maxPoints: 5},
                    {skip: false, src: '/talents-icons/7.jpg', name: 'Natural Shapeshifter', maxPoints: 3},
                ],
                [
                    {skip: false, src: '/talents-icons/8.jpg', name: 'Improved Thorns', maxPoints: 3},
                    {skip: true},
                    {skip: false, src: '/talents-icons/9.jpg', name: 'Omen of Clarity', maxPoints: 1},
                    {skip: false, src: '/talents-icons/10.jpg', name: 'Nature\'s Reach', maxPoints: 2},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/11.jpg', name: 'Vengeance', maxPoints: 5},
                    {skip: false, src: '/talents-icons/12.jpg', name: 'Improved Starfire', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/13.jpg', name: 'Nature\'s Grace', maxPoints: 1},
                    {skip: false, src: '/talents-icons/14.jpg', name: 'Moonglow', maxPoints: 3},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/15.jpg', name: 'Moonfury', maxPoints: 5},
                    {skip: true},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/16.jpg', name: 'Moonkin Form', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ],
            ]
        },
        FeralCombat: {
            background: '/talents-backgrounds/2.jpg',
            talents: [
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/17.jpg', name: 'Ferocity', maxPoints: 5},
                    {skip: false, src: '/talents-icons/18.jpg', name: 'Feral Aggression', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/19.jpg', name: 'Feral Instinct', maxPoints: 5},
                    {skip: false, src: '/talents-icons/20.jpg', name: 'Brutal Impact', maxPoints: 2},
                    {skip: false, src: '/talents-icons/21.jpg', name: 'Thick Hide', maxPoints: 3},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/22.jpg', name: 'Feline Swiftness', maxPoints: 2},
                    {skip: false, src: '/talents-icons/23.jpg', name: 'Feral Charge', maxPoints: 1},
                    {skip: false, src: '/talents-icons/24.jpg', name: 'Sharpened Claws', maxPoints: 3},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/25.jpg', name: 'Improved Shred', maxPoints: 2},
                    {skip: false, src: '/talents-icons/26.jpg', name: 'Predatory Strikes', maxPoints: 3},
                    {skip: false, src: '/talents-icons/27.jpg', name: 'Blood Frenzy', maxPoints: 2},
                    {skip: false, src: '/talents-icons/28.jpg', name: 'Primal Fury', maxPoints: 2},
                ],
                [
                    {skip: false, src: '/talents-icons/29.jpg', name: 'Savage Fury', maxPoints: 2},
                    {skip: true},
                    {skip: false, src: '/talents-icons/30.jpg', name: 'Faerie Fire (Feral)', maxPoints: 1},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/31.jpg', name: 'Heart of the Wild', maxPoints: 5},
                    {skip: true},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/32.jpg', name: 'Leader of the Pack', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ]
            ]
        },
        Restoration: {
            background: '/talents-backgrounds/3.jpg',
            talents: [
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/33.jpg', name: 'Improved Mark of the Wild', maxPoints: 5},
                    {skip: false, src: '/talents-icons/34.jpg', name: 'Furor', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/35.jpg', name: 'Improved Healing Touch', maxPoints: 5},
                    {skip: false, src: '/talents-icons/36.jpg', name: 'Nature\'s Focus', maxPoints: 5},
                    {skip: false, src: '/talents-icons/37.jpg', name: 'Improved Enrage', maxPoints: 2},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/38.jpg', name: 'Reflection', maxPoints: 3},
                    {skip: false, src: '/talents-icons/39.jpg', name: 'Insect Swarm', maxPoints: 1},
                    {skip: false, src: '/talents-icons/40.jpg', name: 'Subtlety', maxPoints: 5},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/41.jpg', name: 'Tranquil Spirit', maxPoints: 5},
                    {skip: true},
                    {skip: false, src: '/talents-icons/42.jpg', name: 'Improved Rejuvenation', maxPoints: 3},
                ],
                [
                    {skip: false, src: '/talents-icons/43.jpg', name: 'Nature\'s Swiftness', maxPoints: 1},
                    {skip: true},
                    {skip: false, src: '/talents-icons/44.jpg', name: 'Gift of Nature', maxPoints: 5},
                    {skip: false, src: '/talents-icons/45.jpg', name: 'Improved Tranquility', maxPoints: 2},
                ],
                [
                    {skip: true},
                    {skip: true},
                    {skip: false, src: '/talents-icons/46.jpg', name: 'Nature\'s Bounty', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/47.jpg', name: 'Swiftmend', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ]
            ]
        },
    },
    Hunter: {
        BeastMastery: {
            background: '/talents-backgrounds/4.jpg',
            talents: [
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/48.jpg', name: 'Improved Aspect of the Hawk', maxPoints: 5},
                    {skip: false, src: '/talents-icons/49.jpg', name: 'Endurance Training', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/50.jpg', name: 'Improved Eyes of the Beast', maxPoints: 2},
                    {
                        skip: false,
                        src: '/talents-icons/51.jpg',
                        name: 'Improved Aspect of the Monkey',
                        maxPoints: 5
                    },
                    {skip: false, src: '/talents-icons/52.jpg', name: 'Thick Hide', maxPoints: 3},
                    {skip: false, src: '/talents-icons/53.jpg', name: 'Improved Revive Pet', maxPoints: 2},
                ],
                [
                    {skip: false, src: '/talents-icons/54.jpg', name: 'Pathfinding', maxPoints: 2},
                    {skip: false, src: '/talents-icons/55.jpg', name: 'Bestial Swiftness', maxPoints: 1},
                    {skip: false, src: '/talents-icons/56.jpg', name: 'Unleashed Fury', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/57.jpg', name: 'Improved Mend Pet', maxPoints: 2},
                    {skip: false, src: '/talents-icons/58.jpg', name: 'Ferocity', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/59.jpg', name: 'Spirit Bond', maxPoints: 2},
                    {skip: false, src: '/talents-icons/60.jpg', name: 'Intimidation', maxPoints: 1},
                    {skip: true},
                    {skip: false, src: '/talents-icons/61.jpg', name: 'Bestial Discipline', maxPoints: 2},
                ],
                [
                    {skip: true},
                    {skip: true},
                    {skip: false, src: '/talents-icons/62.jpg', name: 'Frenzy', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/63.jpg', name: 'Bestial Wrath', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ]
            ],
        },
        Marksmanship: {
            background: '/talents-backgrounds/5.jpg',
            talents: [
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/64.jpg', name: 'Improved Concussive Shot', maxPoints: 5},
                    {skip: false, src: '/talents-icons/65.jpg', name: 'Efficiency', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/66.jpg', name: 'Improved Hunter\'s Mark', maxPoints: 5},
                    {skip: false, src: '/talents-icons/67.jpg', name: 'Lethal Shots', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/68.jpg', name: 'Aimed Shot', maxPoints: 1},
                    {skip: false, src: '/talents-icons/69.jpg', name: 'Improved Arcane Shot', maxPoints: 5},
                    {skip: true},
                    {skip: false, src: '/talents-icons/70.jpg', name: 'Hawk Eye', maxPoints: 3},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/71.jpg', name: 'Improved Serpent Sting', maxPoints: 5},
                    {skip: false, src: '/talents-icons/72.jpg', name: 'Mortal Shots', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/73.jpg', name: 'Scatter Shot', maxPoints: 1},
                    {skip: false, src: '/talents-icons/74.jpg', name: 'Barrage', maxPoints: 3},
                    {skip: false, src: '/talents-icons/75.jpg', name: 'Improved Scorpid Sting', maxPoints: 3},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: true},
                    {skip: false, src: '/talents-icons/76.jpg', name: 'Ranged Weapon Specialization', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/77.jpg', name: 'Trueshot Aura', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ]
            ]
        },
        Survival: {
            background: '/talents-backgrounds/6.jpg',
            talents: [
                [
                    {skip: false, src: '/talents-icons/78.jpg', name: 'Monster Slaying', maxPoints: 3},
                    {skip: false, src: '/talents-icons/79.jpg', name: 'Humanoid Slaying', maxPoints: 3},
                    {skip: false, src: '/talents-icons/80.jpg', name: 'Deflection', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/81.jpg', name: 'Entrapment', maxPoints: 5},
                    {skip: false, src: '/talents-icons/82.jpg', name: 'Savage Strikes', maxPoints: 2},
                    {skip: false, src: '/talents-icons/83.jpg', name: 'Improved Wing Clip', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/84.jpg', name: 'Clever Traps', maxPoints: 2},
                    {skip: false, src: '/talents-icons/85.jpg', name: 'Survivalist', maxPoints: 5},
                    {skip: false, src: '/talents-icons/86.jpg', name: 'Deterrence', maxPoints: 1},
                ],
                [
                    {skip: false, src: '/talents-icons/87.jpg', name: 'Trap Mastery', maxPoints: 2},
                    {skip: false, src: '/talents-icons/88.jpg', name: 'Surefooted', maxPoints: 3},
                    {skip: true},
                    {skip: false, src: '/talents-icons/89.jpg', name: 'Improved Feign Death', maxPoints: 2},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/90.jpg', name: 'Killer Instinct', maxPoints: 3},
                    {skip: false, src: '/talents-icons/91.jpg', name: 'Counterattack', maxPoints: 1},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: true},
                    {skip: false, src: '/talents-icons/92.jpg', name: 'Lightning Reflexes', maxPoints: 3},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/93.jpg', name: 'Wyvern Sting', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ],
            ]
        }
    },
    Mage: {
        Arcane: {
            background: '/talents-backgrounds/7.jpg',
            talents: [
                [
                    {skip: false, src: '/talents-icons/94.jpg', name: 'Arcane Subtlety', maxPoints: 2},
                    {skip: false, src: '/talents-icons/95.jpg', name: 'Arcane Focus', maxPoints: 3},
                    {skip: false, src: '/talents-icons/96.jpg', name: 'Improved Arcane Missiles', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/97.jpg', name: 'Wand Specialization', maxPoints: 2},
                    {skip: false, src: '/talents-icons/98.jpg', name: 'Magic Absorption', maxPoints: 5},
                    {skip: false, src: '/talents-icons/99.jpg', name: 'Arcane Concentration', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/100.jpg', name: 'Magic Attunement', maxPoints: 2},
                    {skip: false, src: '/talents-icons/101.jpg', name: 'Improved Arcane Explosion', maxPoints: 5},
                    {skip: false, src: '/talents-icons/102.jpg', name: 'Arcane Resilience', maxPoints: 1},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/103.jpg', name: 'Improved Mana Shield', maxPoints: 2},
                    {skip: false, src: '/talents-icons/104.jpg', name: 'Improved Counterspell', maxPoints: 2},
                    {skip: true},
                    {skip: false, src: '/talents-icons/105.jpg', name: 'Arcane Meditation', maxPoints: 3},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/106.jpg', name: 'Presence of Mind', maxPoints: 1},
                    {skip: false, src: '/talents-icons/107.jpg', name: 'Arcane Mind', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/108.jpg', name: 'Arcane Instability', maxPoints: 3},
                    {skip: true},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/109.jpg', name: 'Arcane Power', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ]
            ]
        },
        Fire: {
            background: '/talents-backgrounds/8.jpg',
            talents: [
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/110.jpg', name: 'Improved Fireball', maxPoints: 5},
                    {skip: false, src: '/talents-icons/111.jpg', name: 'Impact', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/112.jpg', name: 'Ignite', maxPoints: 5},
                    {skip: false, src: '/talents-icons/113.jpg', name: 'Flame Throwing', maxPoints: 2},
                    {skip: false, src: '/talents-icons/114.jpg', name: 'Improved Fire Blast', maxPoints: 3},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/115.jpg', name: 'Incinerate', maxPoints: 2},
                    {skip: false, src: '/talents-icons/116.jpg', name: 'Improved Flamestrike', maxPoints: 3},
                    {skip: false, src: '/talents-icons/117.jpg', name: 'Pyroblast', maxPoints: 1},
                    {skip: false, src: '/talents-icons/118.jpg', name: 'Burning Soul', maxPoints: 2},
                ],
                [
                    {skip: false, src: '/talents-icons/119.jpg', name: 'Improved Scorch', maxPoints: 5},
                    {skip: false, src: '/talents-icons/120.jpg', name: 'Improved Fire Ward', maxPoints: 2},
                    {skip: true},
                    {skip: false, src: '/talents-icons/121.jpg', name: 'Master of Elements', maxPoints: 3},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/122.jpg', name: 'Critical Mass', maxPoints: 3},
                    {skip: false, src: '/talents-icons/123.jpg', name: 'Blast Wave', maxPoints: 1},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: true},
                    {skip: false, src: '/talents-icons/124.jpg', name: 'Fire Power', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/125.jpg', name: 'Combustion', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ]
            ]
        },
        Frost: {
            background: '/talents-backgrounds/9.jpg',
            talents: [
                [
                    {skip: false, src: '/talents-icons/126.jpg', name: 'Frost Warding', maxPoints: 2},
                    {skip: false, src: '/talents-icons/127.jpg', name: 'Improved Frostbolt', maxPoints: 5},
                    {skip: false, src: '/talents-icons/128.jpg', name: 'Elemental Precision', maxPoints: 3},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/129.jpg', name: 'Ice Shards', maxPoints: 5},
                    {skip: false, src: '/talents-icons/130.jpg', name: 'Frostbite', maxPoints: 3},
                    {skip: false, src: '/talents-icons/131.jpg', name: 'Improved Frost Nova', maxPoints: 2},
                    {skip: false, src: '/talents-icons/132.jpg', name: 'Permafrost', maxPoints: 3},
                ],
                [
                    {skip: false, src: '/talents-icons/133.jpg', name: 'Piercing Ice', maxPoints: 3},
                    {skip: false, src: '/talents-icons/134.jpg', name: 'Cold Snap', maxPoints: 1},
                    {skip: true},
                    {skip: false, src: '/talents-icons/135.jpg', name: 'Improved Blizzard', maxPoints: 3},
                ],
                [
                    {skip: false, src: '/talents-icons/136.jpg', name: 'Arctic Reach', maxPoints: 2},
                    {skip: false, src: '/talents-icons/137.jpg', name: 'Frost Channeling', maxPoints: 3},
                    {skip: false, src: '/talents-icons/138.jpg', name: 'Shatter', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/139.jpg', name: 'Ice Block', maxPoints: 1},
                    {skip: false, src: '/talents-icons/140.jpg', name: 'Improved Cone of Cold', maxPoints: 3},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: true},
                    {skip: false, src: '/talents-icons/141.jpg', name: 'Winter\'s Chill', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/142.jpg', name: 'Ice Barrier', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ]
            ]
        }
    },
    Paladin: {
        Holy: {
            background: '/talents-backgrounds/10.jpg',
            talents: [
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/143.jpg', name: 'Divine Strength', maxPoints: 5},
                    {skip: false, src: '/talents-icons/144.jpg', name: 'Divine Intellect', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/145.jpg', name: 'Spiritual Focus', maxPoints: 5},
                    {
                        skip: false,
                        src: '/talents-icons/146.jpg',
                        name: 'Improved Seal of Righteousness',
                        maxPoints: 5
                    },
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/147.jpg', name: 'Healing Light', maxPoints: 3},
                    {skip: false, src: '/talents-icons/148.jpg', name: 'Consecration', maxPoints: 1},
                    {skip: false, src: '/talents-icons/149.jpg', name: 'Improved Lay on Hands', maxPoints: 2},
                    {skip: false, src: '/talents-icons/150.jpg', name: 'Unyielding Faith', maxPoints: 2},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/151.jpg', name: 'Illumination', maxPoints: 5},
                    {skip: false, src: '/talents-icons/152.jpg', name: 'Improved Blessing of Wisdom', maxPoints: 2},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/153.jpg', name: 'Divine Favor', maxPoints: 1},
                    {skip: false, src: '/talents-icons/154.jpg', name: 'Lasting Judgement', maxPoints: 3},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: true},
                    {skip: false, src: '/talents-icons/155.jpg', name: 'Holy Power', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/156.jpg', name: 'Holy Shock', maxPoints: 1},
                    {skip: true},
                    {skip: true}
                ]
            ]
        },
        Protection: {
            background: '/talents-backgrounds/11.jpg',
            talents: [
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/157.jpg', name: 'Improved Devotion Aura', maxPoints: 5},
                    {skip: false, src: '/talents-icons/158.jpg', name: 'Redoubt', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/159.jpg', name: 'Precision', maxPoints: 3},
                    {skip: false, src: '/talents-icons/160.jpg', name: 'Guardian\'s Favor', maxPoints: 2},
                    {skip: true},
                    {skip: false, src: '/talents-icons/161.jpg', name: 'Toughness', maxPoints: 5},
                ],
                [
                    {skip: false, src: '/talents-icons/162.jpg', name: 'Blessing of Kings', maxPoints: 1},
                    {skip: false, src: '/talents-icons/163.jpg', name: 'Improved Righteous Fury', maxPoints: 3},
                    {skip: false, src: '/talents-icons/164.jpg', name: 'Shield Specialization', maxPoints: 3},
                    {skip: false, src: '/talents-icons/165.jpg', name: 'Anticipation', maxPoints: 5},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/166.jpg', name: 'Improved Hammer of Justice', maxPoints: 3},
                    {skip: false, src: '/talents-icons/167.jpg', name: 'Improved Concentration Aura', maxPoints: 3},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/168.jpg', name: 'Blessing of Sanctuary', maxPoints: 1},
                    {skip: false, src: '/talents-icons/169.jpg', name: 'Reckoning', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: true},
                    {
                        skip: false,
                        src: '/talents-icons/170.jpg',
                        name: 'One-Handed Weapon Specialization',
                        maxPoints: 3
                    },
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/171.jpg', name: 'Holy Shield', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ]
            ]
        },
        Retribution: {
            background: '/talents-backgrounds/12.jpg',
            talents: [
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/172.jpg', name: 'Improved Blessing of Might', maxPoints: 5},
                    {skip: false, src: '/talents-icons/173.jpg', name: 'Benediction', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/174.jpg', name: 'Improved Judgement', maxPoints: 2},
                    {
                        skip: false,
                        src: '/talents-icons/175.jpg',
                        name: 'Improved Seal of the Crusader',
                        maxPoints: 3
                    },
                    {skip: false, src: '/talents-icons/176.jpg', name: 'Deflection', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/177.jpg', name: 'Vindication', maxPoints: 2},
                    {skip: false, src: '/talents-icons/178.jpg', name: 'Conviction', maxPoints: 5},
                    {skip: false, src: '/talents-icons/179.jpg', name: 'Seal of Command', maxPoints: 1},
                    {skip: false, src: '/talents-icons/180.jpg', name: 'Pursuit of Justice', maxPoints: 2},
                ],
                [
                    {skip: false, src: '/talents-icons/181.jpg', name: 'Eye for an Eye', maxPoints: 2},
                    {skip: true},
                    {skip: false, src: '/talents-icons/182.jpg', name: 'Improved Retribution Aura', maxPoints: 2},
                    {skip: true},
                ],
                [
                    {
                        skip: false,
                        src: '/talents-icons/183.jpg',
                        name: 'Two-Handed Weapon Specialization',
                        maxPoints: 3
                    },
                    {skip: true},
                    {skip: false, src: '/talents-icons/184.jpg', name: 'Sanctity Aura', maxPoints: 1},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: true},
                    {skip: false, src: '/talents-icons/185.jpg', name: 'Vengeance', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/186.jpg', name: 'Repentance', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ]
            ]
        }
    },
    Priest: {
        Discipline: {
            background: '/talents-backgrounds/13.jpg',
            talents: [
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/187.jpg', name: 'Unbreakable Will', maxPoints: 5},
                    {skip: false, src: '/talents-icons/188.jpg', name: 'Wand Specialization', maxPoints: 2},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/189.jpg', name: 'Silent Resolve', maxPoints: 5},
                    {
                        skip: false,
                        src: '/talents-icons/190.jpg',
                        name: 'Improved Power Word: Fortitude',
                        maxPoints: 2
                    },
                    {skip: false, src: '/talents-icons/191.jpg', name: 'Improved Power Word: Shield', maxPoints: 3},
                    {skip: false, src: '/talents-icons/192.jpg', name: 'Martyrdom', maxPoints: 2},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/193.jpg', name: 'Inner Focus', maxPoints: 1},
                    {skip: false, src: '/talents-icons/194.jpg', name: 'Meditation', maxPoints: 3},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/195.jpg', name: 'Improved Inner Fire', maxPoints: 3},
                    {skip: false, src: '/talents-icons/196.jpg', name: 'Mental Agility', maxPoints: 5},
                    {skip: true},
                    {skip: false, src: '/talents-icons/197.jpg', name: 'Improved Mana Burn', maxPoints: 2},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/198.jpg', name: 'Mental Strength', maxPoints: 5},
                    {skip: false, src: '/talents-icons/199.jpg', name: 'Divine Spirit', maxPoints: 1},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: true},
                    {skip: false, src: '/talents-icons/200.jpg', name: 'Force of Will', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/201.jpg', name: 'Power Infusion', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ]
            ]
        },
        Holy: {
            background: '/talents-backgrounds/14.jpg',
            talents: [
                [
                    {skip: false, src: '/talents-icons/202.jpg', name: 'Healing Focus', maxPoints: 2},
                    {skip: false, src: '/talents-icons/203.jpg', name: 'Improved Renew', maxPoints: 3},
                    {skip: false, src: '/talents-icons/204.jpg', name: 'Holy Specialization', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/205.jpg', name: 'Spell Warding', maxPoints: 5},
                    {skip: false, src: '/talents-icons/206.jpg', name: 'Divine Fury', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/207.jpg', name: 'Holy Nova', maxPoints: 1},
                    {skip: false, src: '/talents-icons/208.jpg', name: 'Blessed Recovery', maxPoints: 3},
                    {skip: true},
                    {skip: false, src: '/talents-icons/209.jpg', name: 'Inspiration', maxPoints: 3},
                ],
                [
                    {skip: false, src: '/talents-icons/210.jpg', name: 'Holy Reach', maxPoints: 2},
                    {skip: false, src: '/talents-icons/211.jpg', name: 'Improved Healing', maxPoints: 3},
                    {skip: false, src: '/talents-icons/212.jpg', name: 'Searing Light', maxPoints: 1},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/213.jpg', name: 'Improved Prayer of Healing', maxPoints: 2},
                    {skip: false, src: '/talents-icons/214.jpg', name: 'Spirit of Redemption', maxPoints: 1},
                    {skip: false, src: '/talents-icons/215.jpg', name: 'Spiritual Guidance', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: true},
                    {skip: false, src: '/talents-icons/216.jpg', name: 'Spiritual Healing', maxPoints: 5},
                    {skip: true,}
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/217.jpg', name: 'Lightwell', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ]
            ]
        },
        Shadow: {
            background: '/talents-backgrounds/15.jpg',
            talents: [
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/218.jpg', name: 'Spirit Tap', maxPoints: 5},
                    {skip: false, src: '/talents-icons/219.jpg', name: 'Blackout', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/220.jpg', name: 'Shadow Affinity', maxPoints: 3},
                    {skip: false, src: '/talents-icons/221.jpg', name: 'Improved Shadow Word: Pain', maxPoints: 2},
                    {skip: false, src: '/talents-icons/222.jpg', name: 'Shadow Focus', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/223.jpg', name: 'Improved Psychic Scream', maxPoints: 2},
                    {skip: false, src: '/talents-icons/224.jpg', name: 'Improved Mind Blast', maxPoints: 5},
                    {skip: false, src: '/talents-icons/225.jpg', name: 'Mind Flay', maxPoints: 1},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/226.jpg', name: 'Improved Fade', maxPoints: 2},
                    {skip: false, src: '/talents-icons/227.jpg', name: 'Shadow Reach', maxPoints: 3},
                    {skip: false, src: '/talents-icons/228.jpg', name: 'Shadow Weaving', maxPoints: 5},
                ],
                [
                    {skip: false, src: '/talents-icons/229.jpg', name: 'Silence', maxPoints: 1},
                    {skip: false, src: '/talents-icons/230.jpg', name: 'Vampiric Embrace', maxPoints: 1},
                    {skip: false, src: '/talents-icons/231.jpg', name: 'Improved Vampiric Embrace', maxPoints: 2},

                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: true},
                    {skip: false, src: '/talents-icons/232.jpg', name: 'Darkness', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/233.jpg', name: 'Shadowform', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ],
            ]
        }
    },
    Rogue: {
        Assassination: {
            background: '/talents-backgrounds/16.jpg',
            talents: [
                [
                    {skip: false, src: '/talents-icons/234.jpg', name: 'Improved Eviscerate', maxPoints: 3},
                    {skip: false, src: '/talents-icons/235.jpg', name: 'Remorseless Attacks', maxPoints: 2},
                    {skip: false, src: '/talents-icons/236.jpg', name: 'Malice', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/237.jpg', name: 'Ruthlessness', maxPoints: 3},
                    {skip: false, src: '/talents-icons/238.jpg', name: 'Murder', maxPoints: 2},
                    {skip: true},
                    {skip: false, src: '/talents-icons/239.jpg', name: 'Improved Slice and Dice', maxPoints: 3}
                ],
                [
                    {skip: false, src: '/talents-icons/240.jpg', name: 'Relentless Strikes', maxPoints: 1},
                    {skip: false, src: '/talents-icons/241.jpg', name: 'Improved Expose Armor', maxPoints: 2},
                    {skip: false, src: '/talents-icons/242.jpg', name: 'Lethalty', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/243.jpg', name: 'Vile Poisons', maxPoints: 5},
                    {skip: false, src: '/talents-icons/244.jpg', name: 'Improved poisons', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/245.jpg', name: 'Cold Blood', maxPoints: 1},
                    {skip: false, src: '/talents-icons/246.jpg', name: 'Improved Kidney Shot', maxPoints: 3},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/247.jpg', name: 'Seal Fate', maxPoints: 5},
                    {skip: true},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/248.jpg', name: 'Vigor', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ],
            ]
        },
        Combat: {
            background: '/talents-backgrounds/17.jpg',
            talents: [
                [
                    {skip: false, src: '/talents-icons/249.jpg', name: 'Improved Gouge', maxPoints: 3},
                    {skip: false, src: '/talents-icons/250.jpg', name: 'Improved Sinister Strike', maxPoints: 2},
                    {skip: false, src: '/talents-icons/251.jpg', name: 'Lightning Reflexes', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/252.jpg', name: 'Improved Backstab', maxPoints: 3},
                    {skip: false, src: '/talents-icons/253.jpg', name: 'Deflection', maxPoints: 5},
                    {skip: false, src: '/talents-icons/254.jpg', name: 'Precision', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/255.jpg', name: 'Endurance', maxPoints: 2},
                    {skip: false, src: '/talents-icons/256.jpg', name: 'Riposte', maxPoints: 1},
                    {skip: true},
                    {skip: false, src: '/talents-icons/257.jpg', name: 'Improved Sprint', maxPoints: 2},
                ],
                [
                    {skip: false, src: '/talents-icons/258.jpg', name: 'Improved Kick', maxPoints: 2},
                    {skip: false, src: '/talents-icons/259.jpg', name: 'Dagger Specialization', maxPoints: 5},
                    {skip: false, src: '/talents-icons/260.jpg', name: 'Dual Wield Specialization', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/261.jpg', name: 'Mace Specialization', maxPoints: 5},
                    {skip: false, src: '/talents-icons/262.jpg', name: 'Blade Flurry', maxPoints: 1},
                    {skip: false, src: '/talents-icons/263.jpg', name: 'Sword Specialization', maxPoints: 5},
                    {skip: false, src: '/talents-icons/264.jpg', name: 'Fist Weapon Specialization', maxPoints: 5},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/265.jpg', name: 'Weapon Expertise', maxPoints: 2},
                    {skip: false, src: '/talents-icons/266.jpg', name: 'Aggression', maxPoints: 3},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/267.jpg', name: 'Adrenaline Rush', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ],
            ]
        },
        Subtlety: {
            background: '/talents-backgrounds/18.jpg',
            talents: [
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/268.jpg', name: 'Master of Deception', maxPoints: 5},
                    {skip: false, src: '/talents-icons/269.jpg', name: 'Opportunity', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/270.jpg', name: 'Sleight of Hand', maxPoints: 2},
                    {skip: false, src: '/talents-icons/271.jpg', name: 'Elusiveness', maxPoints: 2},
                    {skip: false, src: '/talents-icons/272.jpg', name: 'Camouflage', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/273.jpg', name: 'Initiative', maxPoints: 3},
                    {skip: false, src: '/talents-icons/274.jpg', name: 'Ghostly Strike', maxPoints: 1},
                    {skip: false, src: '/talents-icons/275.jpg', name: 'Improved Ambush', maxPoints: 3},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/276.jpg', name: 'Setup', maxPoints: 3},
                    {skip: false, src: '/talents-icons/277.jpg', name: 'Improved Sap', maxPoints: 3},
                    {skip: false, src: '/talents-icons/278.jpg', name: 'Serrated Blades', maxPoints: 3},

                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/279.jpg', name: 'Heightened Senses', maxPoints: 2},
                    {skip: false, src: '/talents-icons/280.jpg', name: 'Preparation', maxPoints: 1},
                    {skip: false, src: '/talents-icons/281.jpg', name: 'Dirty Deeds', maxPoints: 2},
                    {skip: false, src: '/talents-icons/282.jpg', name: 'Hemorrhage', maxPoints: 1},
                ],
                [
                    {skip: true},
                    {skip: true},
                    {skip: false, src: '/talents-icons/283.jpg', name: 'Deadliness', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/284.jpg', name: 'Premeditation', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ],
            ]
        }
    },
    Shaman: {
        Elemental: {
            background: '/talents-backgrounds/19.jpg',
            talents: [
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/285.jpg', name: 'Convection', maxPoints: 5},
                    {skip: false, src: '/talents-icons/286.jpg', name: 'Concussion', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/287.jpg', name: 'Earth\'s Grasp', maxPoints: 2},
                    {skip: false, src: '/talents-icons/288.jpg', name: 'Elemental Warding', maxPoints: 3},
                    {skip: false, src: '/talents-icons/289.jpg', name: 'Call of Flame', maxPoints: 2},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/290.jpg', name: 'Elemental Focus', maxPoints: 1},
                    {skip: false, src: '/talents-icons/291.jpg', name: 'Reverberation', maxPoints: 5},
                    {skip: false, src: '/talents-icons/292.jpg', name: 'Call of Thunder', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/293.jpg', name: 'Improved Fire Totems', maxPoints: 2},
                    {skip: false, src: '/talents-icons/294.jpg', name: 'Eye of the Storm', maxPoints: 3},
                    {skip: true},
                    {skip: false, src: '/talents-icons/295.jpg', name: 'Elemental Devastation', maxPoints: 3},
                ],
                [
                    {skip: false, src: '/talents-icons/296.jpg', name: 'Storm Reach', maxPoints: 2},
                    {skip: false, src: '/talents-icons/297.jpg', name: 'Elemental Fury', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: true},
                    {skip: false, src: '/talents-icons/298.jpg', name: 'Lightning Mastery', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/299.jpg', name: 'Elemental Mastery', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ],
            ]
        },
        Enhancement: {
            background: '/talents-backgrounds/20.jpg',
            talents: [
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/300.jpg', name: 'Ancestral Knowledge', maxPoints: 5},
                    {skip: false, src: '/talents-icons/301.jpg', name: 'Shield Specialization', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/302.jpg', name: 'Guardian Totems', maxPoints: 2},
                    {skip: false, src: '/talents-icons/303.jpg', name: 'Thundering Strikes', maxPoints: 5},
                    {skip: false, src: '/talents-icons/304.jpg', name: 'Improved Ghost Wolf', maxPoints: 2},
                    {skip: false, src: '/talents-icons/305.jpg', name: 'Improved Lightning Shield', maxPoints: 3},
                ],
                [
                    {skip: false, src: '/talents-icons/306.jpg', name: 'Enhancing Totems', maxPoints: 2},
                    {skip: true},
                    {skip: false, src: '/talents-icons/307.jpg', name: 'Two-Handed Axes and Maces', maxPoints: 1},
                    {skip: false, src: '/talents-icons/308.jpg', name: 'Anticipation', maxPoints: 5},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/309.jpg', name: 'Flurry', maxPoints: 5},
                    {skip: false, src: '/talents-icons/310.jpg', name: 'Toughness', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/311.jpg', name: 'Improved Weapon Totems', maxPoints: 2},
                    {skip: false, src: '/talents-icons/312.jpg', name: 'Elemental Weapons', maxPoints: 3},
                    {skip: false, src: '/talents-icons/313.jpg', name: 'Parry', maxPoints: 1},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: true},
                    {skip: false, src: '/talents-icons/314.jpg', name: 'Weapon Mastery', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/315.jpg', name: 'Stormstrike', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ],
            ]
        },
        Restoration: {
            background: '/talents-backgrounds/21.jpg',
            talents: [
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/316.jpg', name: 'Improved Healing Wave', maxPoints: 5},
                    {skip: false, src: '/talents-icons/317.jpg', name: 'Tidal Focus', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/318.jpg', name: 'Improved Reincarnation', maxPoints: 2},
                    {skip: false, src: '/talents-icons/319.jpg', name: 'Ancestral Healing', maxPoints: 3},
                    {skip: false, src: '/talents-icons/320.jpg', name: 'Totemic Focus', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/321.jpg', name: 'Nature\'s Guidance', maxPoints: 3},
                    {skip: false, src: '/talents-icons/322.jpg', name: 'Healing Focus', maxPoints: 3},
                    {skip: false, src: '/talents-icons/323.jpg', name: 'Tidal Mastery', maxPoints: 5},
                    {skip: false, src: '/talents-icons/324.jpg', name: 'Healing Grace', maxPoints: 3},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/325.jpg', name: 'Restorative Totems', maxPoints: 5},
                    {skip: false, src: '/talents-icons/326.jpg', name: 'Tidal Mastery', maxPoints: 1},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/327.jpg', name: 'Healing Way', maxPoints: 3},
                    {skip: true},
                    {skip: false, src: '/talents-icons/328.jpg', name: 'Nature\'s Swiftness', maxPoints: 1},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: true},
                    {skip: false, src: '/talents-icons/329.jpg', name: 'Purification', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/330.jpg', name: 'Mana Tide Totem', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ],
            ]
        }
    },
    Warlock: {
        Affliction: {
            background: '/talents-backgrounds/22.jpg',
            talents: [
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/331.jpg', name: 'Suppression', maxPoints: 5},
                    {skip: false, src: '/talents-icons/332.jpg', name: 'Improved Corruption', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/333.jpg', name: 'Improved Curse of Weakness', maxPoints: 3},
                    {skip: false, src: '/talents-icons/334.jpg', name: 'Improved Drain Soul', maxPoints: 2},
                    {skip: false, src: '/talents-icons/335.jpg', name: 'Improved Life Tap', maxPoints: 2},
                    {skip: false, src: '/talents-icons/336.jpg', name: 'Improved Drain Life', maxPoints: 5},
                ],
                [
                    {skip: false, src: '/talents-icons/337.jpg', name: 'Improved Curse of Agony', maxPoints: 3},
                    {skip: false, src: '/talents-icons/338.jpg', name: 'Fel Concentration', maxPoints: 5},
                    {skip: false, src: '/talents-icons/339.jpg', name: 'Amplify Curse', maxPoints: 1},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/340.jpg', name: 'Grim Reach', maxPoints: 2},
                    {skip: false, src: '/talents-icons/341.jpg', name: 'Nightfall', maxPoints: 2},
                    {skip: true},
                    {skip: false, src: '/talents-icons/342.jpg', name: 'Improved Drain Mana', maxPoints: 2},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/343.jpg', name: 'Siphon Life', maxPoints: 1},
                    {skip: false, src: '/talents-icons/344.jpg', name: 'Curse of Exhaustion', maxPoints: 1},
                    {skip: false, src: '/talents-icons/345.jpg', name: 'Improved Curse of Exhaustion', maxPoints: 4},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/346.jpg', name: 'Shadow Mastery', maxPoints: 5},
                    {skip: true},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/347.jpg', name: 'Dark Pact', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ],
            ]
        },
        Demonology: {
            background: '/talents-backgrounds/23.jpg',
            talents: [
                [
                    {skip: false, src: '/talents-icons/348.jpg', name: 'Improved Healthstone', maxPoints: 2},
                    {skip: false, src: '/talents-icons/349.jpg', name: 'Improved Imp', maxPoints: 3},
                    {skip: false, src: '/talents-icons/350.jpg', name: 'Demonic Embrace', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/351.jpg', name: 'Improved Health Funnel', maxPoints: 2},
                    {skip: false, src: '/talents-icons/352.jpg', name: 'Improved Voidwalker', maxPoints: 3},
                    {skip: false, src: '/talents-icons/353.jpg', name: 'Fel Intellect', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/354.jpg', name: 'Improved Succubus', maxPoints: 3},
                    {skip: false, src: '/talents-icons/355.jpg', name: 'Fel Domination', maxPoints: 1},
                    {skip: false, src: '/talents-icons/356.jpg', name: 'Fel Stamina', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/357.jpg', name: 'Master Summoner', maxPoints: 2},
                    {skip: false, src: '/talents-icons/358.jpg', name: 'Unholy Power', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/359.jpg', name: 'Improved Enslave Demon', maxPoints: 2},
                    {skip: false, src: '/talents-icons/360.jpg', name: 'Demonic Sacrifice', maxPoints: 1},
                    {skip: true},
                    {skip: false, src: '/talents-icons/361.jpg', name: 'Improved Firestone', maxPoints: 2},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/362.jpg', name: 'Master Demonologist', maxPoints: 5},
                    {skip: true},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/363.jpg', name: 'Soul Link', maxPoints: 1},
                    {skip: false, src: '/talents-icons/364.jpg', name: 'Improved Spellstone', maxPoints: 2},
                    {skip: true},
                ],
            ]
        },
        Destruction: {
            background: '/talents-backgrounds/24.jpg',
            talents: [
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/365.jpg', name: 'Improved Shadow Bolt', maxPoints: 5},
                    {skip: false, src: '/talents-icons/366.jpg', name: 'Cataclysm', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/367.jpg', name: 'Bane', maxPoints: 5},
                    {skip: false, src: '/talents-icons/368.jpg', name: 'Aftermath', maxPoints: 2},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/369.jpg', name: 'Improved Firebolt', maxPoints: 2},
                    {skip: false, src: '/talents-icons/370.jpg', name: 'Improved Lash of Pain', maxPoints: 2},
                    {skip: false, src: '/talents-icons/371.jpg', name: 'Devastation', maxPoints: 5},
                    {skip: false, src: '/talents-icons/372.jpg', name: 'Shadowburn', maxPoints: 1},
                ],
                [
                    {skip: false, src: '/talents-icons/373.jpg', name: 'Intensity', maxPoints: 2},
                    {skip: false, src: '/talents-icons/374.jpg', name: 'Destructive Reach', maxPoints: 2},
                    {skip: true},
                    {skip: false, src: '/talents-icons/375.jpg', name: 'Improved Searing Pain', maxPoints: 5},
                ],
                [
                    {skip: false, src: '/talents-icons/376.jpg', name: 'Pyroclasm', maxPoints: 2},
                    {skip: false, src: '/talents-icons/377.jpg', name: 'Improved Immolate', maxPoints: 5},
                    {skip: false, src: '/talents-icons/378.jpg', name: 'Ruin', maxPoints: 1},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/379.jpg', name: 'Emberstorm', maxPoints: 5},
                    {skip: true},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/380.jpg', name: 'Conflagrate', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ],
            ]
        }
    },
    Warrior: {
        Arms: {
            background: '/talents-backgrounds/25.jpg',
            talents: [
                [
                    {skip: false, src: '/talents-icons/381.jpg', name: 'Improved Heroic Strike', maxPoints: 3},
                    {skip: false, src: '/talents-icons/382.jpg', name: 'Deflection', maxPoints: 5},
                    {skip: false, src: '/talents-icons/383.jpg', name: 'Improved Rend', maxPoints: 3},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/384.jpg', name: 'Improved Charge', maxPoints: 2},
                    {skip: false, src: '/talents-icons/385.jpg', name: 'Tactical Mastery', maxPoints: 5},
                    {skip: true},
                    {skip: false, src: '/talents-icons/386.jpg', name: 'Improved Thunder Clap', maxPoints: 3},
                ],
                [
                    {skip: false, src: '/talents-icons/387.jpg', name: 'Improved Overpower', maxPoints: 2},
                    {skip: false, src: '/talents-icons/388.jpg', name: 'Anger Management', maxPoints: 1},
                    {skip: false, src: '/talents-icons/389.jpg', name: 'Deep Wounds', maxPoints: 3},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {
                        skip: false,
                        src: '/talents-icons/390.jpg',
                        name: 'Two-Handed Weapon Specialization',
                        maxPoints: 5
                    },
                    {skip: false, src: '/talents-icons/391.jpg', name: 'Impale', maxPoints: 2},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/392.jpg', name: 'Axe Specialization', maxPoints: 5},
                    {skip: false, src: '/talents-icons/393.jpg', name: 'Sweeping Strikes', maxPoints: 1},
                    {skip: false, src: '/talents-icons/394.jpg', name: 'Mace Specialization', maxPoints: 5},
                    {skip: false, src: '/talents-icons/395.jpg', name: 'Sword Specialization', maxPoints: 5},
                ],
                [
                    {skip: false, src: '/talents-icons/396.jpg', name: 'Poleaxe Specialization', maxPoints: 1},
                    {skip: true},
                    {skip: false, src: '/talents-icons/397.jpg', name: 'Improved Hamstring', maxPoints: 3},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/398.jpg', name: 'Mortal Strike', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ],
            ]
        },
        Fury: {
            background: '/talents-backgrounds/26.jpg',
            talents: [
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/399.jpg', name: 'Booming Voice', maxPoints: 5},
                    {skip: false, src: '/talents-icons/400.jpg', name: 'Cruelty', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/401.jpg', name: 'Improved Demoralizing Shout', maxPoints: 5},
                    {skip: false, src: '/talents-icons/402.jpg', name: 'Unbridled Wrath', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/403.jpg', name: 'Improved Cleave', maxPoints: 3},
                    {skip: false, src: '/talents-icons/404.jpg', name: 'Piercing Howl', maxPoints: 1},
                    {skip: false, src: '/talents-icons/405.jpg', name: 'Blood Craze', maxPoints: 3},
                    {skip: false, src: '/talents-icons/406.jpg', name: 'Commanding Presence', maxPoints: 5},
                ],
                [
                    {skip: false, src: '/talents-icons/407.jpg', name: 'Dual Wield Specialization', maxPoints: 5},
                    {skip: false, src: '/talents-icons/408.jpg', name: 'Improved Execute', maxPoints: 2},
                    {skip: false, src: '/talents-icons/409.jpg', name: 'Enrage', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/410.jpg', name: 'Improved Slam', maxPoints: 5},
                    {skip: false, src: '/talents-icons/411.jpg', name: 'Death Wish', maxPoints: 1},
                    {skip: true},
                    {skip: false, src: '/talents-icons/412.jpg', name: 'Improved Intercept', maxPoints: 2},
                ],
                [
                    {skip: false, src: '/talents-icons/413.jpg', name: 'Improved Berserker Rage', maxPoints: 2},
                    {skip: true},
                    {skip: false, src: '/talents-icons/414.jpg', name: 'Flurry', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/415.jpg', name: 'Bloodthirst', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ],
            ]
        },
        Protection: {
            background: '/talents-backgrounds/27.jpg',
            talents: [
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/416.jpg', name: 'Shield Specialization', maxPoints: 5},
                    {skip: false, src: '/talents-icons/417.jpg', name: 'Anticipation', maxPoints: 5},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/418.jpg', name: 'Improved Bloodrage', maxPoints: 2},
                    {skip: true},
                    {skip: false, src: '/talents-icons/419.jpg', name: 'Toughness', maxPoints: 5},
                    {skip: false, src: '/talents-icons/420.jpg', name: 'Iron Will', maxPoints: 5},
                ],
                [
                    {skip: false, src: '/talents-icons/421.jpg', name: 'Last Stand', maxPoints: 1},
                    {skip: false, src: '/talents-icons/422.jpg', name: 'Improved Shield Block', maxPoints: 3},
                    {skip: false, src: '/talents-icons/423.jpg', name: 'Improved Revenge', maxPoints: 3},
                    {skip: false, src: '/talents-icons/424.jpg', name: 'Defiance', maxPoints: 5},
                ],
                [
                    {skip: false, src: '/talents-icons/425.jpg', name: 'Improved Sunder Armor', maxPoints: 3},
                    {skip: false, src: '/talents-icons/426.jpg', name: 'Improved Disarm', maxPoints: 3},
                    {skip: false, src: '/talents-icons/427.jpg', name: 'Improved Taunt', maxPoints: 2},
                    {skip: true},
                ],
                [
                    {skip: false, src: '/talents-icons/428.jpg', name: 'Shield Wall', maxPoints: 2},
                    {skip: false, src: '/talents-icons/429.jpg', name: 'Concussion Blow', maxPoints: 1},
                    {skip: false, src: '/talents-icons/430.jpg', name: 'Improved Shield Bash', maxPoints: 2},
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: true},
                    {
                        skip: false,
                        src: '/talents-icons/431.jpg',
                        name: 'One-Handed Weapon Specialization',
                        maxPoints: 5
                    },
                    {skip: true},
                ],
                [
                    {skip: true},
                    {skip: false, src: '/talents-icons/432.jpg', name: 'Shield Slam', maxPoints: 1},
                    {skip: true},
                    {skip: true},
                ],
            ]
        }
    }
};

export type ClassSpecialization = DruidTalents | HunterTalents | MageTalents | PaladinTalents | PriestTalents | RogueTalents | ShamanTalents | WarlockTalents | WarriorTalents | undefined

export function getClassTalents(className: string): ClassSpecialization {
    if (className !== 'Druid' && className !== 'Hunter' && className !== 'Mage' && className !== 'Paladin' && className !== 'Priest' && className !== 'Rogue' && className !== 'Shaman' && className !== 'Warlock' && className !== 'Warrior') {
        console.error('Invalid class name: '+ className);
        return undefined;
    }

    return talentsPlaceholders[className];
}
