'use client'
import {useParticipants} from "@/app/raid/components/useParticipants";


export function ClassSummary({raidId}: { raidId: string }) {
    const participants = useParticipants(raidId, [])

    const availableClasses = [
        'druid',
        'hunter',
        'mage',
        'paladin',
        'priest',
        'rogue',
        'warlock',
        'warrior',
    ]

    const signupClasses = Object.entries(participants.filter(p => p.details.status === 'confirmed').reduce((acc, participant) => {
        if (!participant?.member?.character?.playable_class?.name) return acc
        acc[participant.member.character.playable_class.name.toLowerCase()]++
        return acc
    }, availableClasses.reduce((acc, classType) => {
        acc[classType] = 0
        return acc
    }, {} as any))).filter(([classType, count]) => availableClasses.includes(classType))

    return (
        <>
            {signupClasses.map(([classType, count]) => (
                <div
                    key={classType}
                    className="flex items-center justify-center gap-0.5 w-16">
                    <img
                        className="w-6 h-6 rounded-full border border-gold"
                        alt={classType}
                        src={`/classicon/classicon_${classType}.jpg`}/>
                    <div className={`text-default text-xs text-center rounded-lg p-2 ${!count ? 'text-red-500': ''}`}>
                        {count as number}
                    </div>
                </div>
            ))}
        </>
    )
}
