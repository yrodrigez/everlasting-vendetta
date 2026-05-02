import { PageEvent } from '@/hooks/usePageEvent';
import { GUILD_REALM_NAME } from '@/util/constants';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'FAQ | Everlasting Vendetta',
    description: `Frequently asked questions about Everlasting Vendetta, raid expectations, recruitment, RRS, loot distribution, and guild conduct on ${GUILD_REALM_NAME}.`,
    openGraph: {
        title: 'FAQ | Everlasting Vendetta',
        description: 'Learn how Everlasting Vendetta raids, recruits, handles loot, manages attendance, and keeps drama out of the guild.',
    },
    twitter: {
        card: 'summary_large_image',
    },
};

const principles = [
    'Raid seriously without turning the guild into a second job.',
    'Respect other people\'s time before, during, and after raids.',
    'Communicate early when plans change.',
    'Keep loot, benches, and recruitment decisions as clear as possible.',
];

const faqSections = [
    {
        title: 'Who are we?',
        items: [
            {
                question: 'What is Everlasting Vendetta?',
                answer: [
                    `Everlasting Vendetta is an active World of Warcraft guild on ${GUILD_REALM_NAME}, built around raiding, dungeons, and a stable group of people who want to enjoy the game without unnecessary drama.`,
                    'Most of us are grown people with jobs, families, schedules, and limited free time. That is exactly why we value preparation, direct communication, and a clean raid environment.',
                ],
            },
            {
                question: 'What is the main goal of the guild?',
                answer: [
                    'Our main goal is simple: raids, clear content, improve as a group, and have a good time doing it.',
                    'We are not interested in turning every disagreement into a debate club. If something needs solving, we solve it. If someone needs a break, that is fine. If someone wants to stop playing, that is also fine. Just let us know early so the team can plan around it.',
                ],
            },
            {
                question: 'What kind of player fits here?',
                answer: [
                    'Players who show up prepared, respect the raid, communicate, and understand that other players\' time and effort matter.',
                ],
            },
        ],
    },
    {
        title: 'Recruitment',
        items: [
            {
                question: 'How do we recruit?',
                answer: [
                    'Everlasting Vendetta is selective. Applicants are reviewed individually based on current guild needs, raid readiness, attitude, communication, and long-term fit.',
                    'Players who are already geared, active, knowledgeable about their class, experienced in the current content, and comfortable using voice communication will usually be looked upon more favorably.',
                    'Applying with friends or family does not guarantee that everyone is accepted together. We do not recruit package deals. Every player accepted into Everlasting Vendetta must meet the same standards on their own.',
                ],
            },
            {
                question: 'What do we expect from applicants?',
                answer: [
                    'Be honest about your experience, availability, goals, and current character state. If your gear, enchants, professions, or schedule need work, say so clearly.',
                    'We would rather play with someone who is direct and improving.',
                ],
            },
            {
                question: 'Where can I apply?',
                answer: [
                    <>
                        You can apply through the <Link href="/apply" className="font-semibold text-gold hover:text-gold-100">application page</Link>. Fill it properly. Low-effort applications usually receive low-effort answers.
                    </>,
                ],
            },
            {
                question: 'How do I become a Raider?',
                answer: [
                    'Raider status is earned through consistent raid participation and reliable communication.',
                    'There are two main ways to qualify:',
                    <>
                        <div className="mt-4 grid gap-2 text-xs text-ivory/75 sm:grid-cols-2">
                            <span className="rounded-lg border border-gold/30 bg-black/20 p-2">8 saves back-to-back (bench qualifies for this)</span>
                            <span className="rounded-lg border border-gold/30 bg-black/20 p-2">12 saves with no gap longer than 2 weeks (bench qualifies for this)</span>
                        </div>
                    </>,
                    'We value people who consistently show up more than people with insane parses who disappear whenever the stars do not align.',
                    'Good performance matters, but reliability is what keeps raids alive. A stable player we can plan around is more valuable than a superstar we need to chase.',
                ],
            }
        ],
    },
    {
        title: 'Raiding and Attendance',
        items: [
            {
                question: 'Who is responsible for raid signups?',
                answer: [
                    'You are. Raid leaders provide the tools, calendar, status options, chat, Discord, and reminders, but your attendance status is your responsibility.',
                    'Use the available signup statuses honestly: Confirmed, Declined, Late, Tentative, or the relevant option available on the raid page. Not responding is worse than declining because it gives the raid lead nothing to plan with.',
                ],
            },
            {
                question: 'What if I cannot attend after signing up?',
                answer: [
                    'Update your status as soon as possible and/or tell the team through one of the MANY available communication channels. Plans change. Real life happens. Silence is the problem.',
                    'If you know you are quitting, taking a break, changing schedule, or cannot keep raiding, tell us. Nobody needs a dramatic farewell speech. We just need to know so we can find a replacement and keep raids stable.',
                ],
            },
            {
                question: 'What behavior is not accepted around raids?',
                answer: [
                    'Any behavior that knowingly wastes the group\'s time is not accepted. For example: signing up for Karazhan, going earlier with a pug, and not updating your status. Or saying nothing when something comes up and the raid is waiting for you.',
                    'If you subscribe to a raid and disappear without updating your status or informing the team, that can end in a guild kick. The issue is not that life happened. The issue is that 9, 19, or 24 other people were left dealing with your silence.',
                ],
            },
        ],
    },
    {
        title: 'RRS and Bench Priority',
        items: [
            {
                question: 'What is RRS?',
                answer: [
                    'RRS is the Raid Reliability Score. It replaced the old "first subscription wins" system with a clearer score that reflects recent raid attendance and a set of multipliers used for raid planning.',
                    'It is a planning tool that helps raid leaders make bench decisions more fairly when more people sign up than there are raid spots.',
                    <div className="mt-4 grid gap-2 text-xs text-ivory/75 sm:grid-cols-3">
                        <span className="rounded-lg border border-gold/30 bg-black/20 p-2">Confirmed: 1.0</span>
                        <span className="rounded-lg border border-gold/30 bg-black/20 p-2">Late: 0.8</span>
                        <span className="rounded-lg border border-gold/30 bg-black/20 p-2">Tentative: 0.4</span>
                        <span className="rounded-lg border border-gold/30 bg-black/20 p-2">Declined: 0.1</span>
                        <span className="rounded-lg border border-gold/30 bg-black/20 p-2">No response: 0</span>
                        <span className="rounded-lg border border-gold/30 bg-black/20 p-2">Bench: 1.0</span>
                    </div>
                ],
            },
            {
                question: 'How is bench priority decided when a raid is full?',
                answer: [
                    'Bench priority considers several factors together: signup status, full enchants, raid participation in the last 10 completed save weeks, signup timing, role needs, and raid lead judgment for that specific raid.',
                    'Being a Raider helps, but it does not automatically guarantee a spot above every non-Raider every time. It is not a permanent immunity card.',
                ],
            },
            {
                question: 'How is recent participation scored?',
                answer: [
                    'Recent participation looks at the last 10 completed save weeks. The current save week is not counted, and more recent weeks matter more than older ones.',
                    'Confirmed and Bench count as 1.0. Late counts as 0.8. Tentative counts as 0.4. Declined counts as 0.1. No response or no participation counts as 0.',
                ],
            },
            {
                question: 'What modifiers affect RRS?',
                answer: [
                    'Being fully enchanted gives a significant boost because an unenchanted character is not raid-ready. Signing up earlier gives a small bonus, while last-minute signups can receive a large penalty. Raider status gives a useful boost, especially in close cases.',
                    'Alts can receive a small penalty compared to mains. New joiners receive temporary protection during their first five weeks so they are not punished too hard while building raid history.',
                ],
            },
            {
                question: 'How can I improve my raid position?',
                answer: [
                    'Sign up early, choose Confirmed whenever possible, show up consistently, keep your character fully enchanted, and avoid unnecessary Late or Tentative signups.',
                    'If you cannot attend, Declined is still better than silence because it helps planning. It is worse than Confirmed or Late, but better than making the raid lead guess.',
                ],
            },
            {
                question: 'Are roles ranked separately?',
                answer: [
                    'Yes. Tanks compete with tanks, healers compete with healers, and DPS compete with DPS. If you select multiple roles, you are considered in each relevant role ranking and placed where you qualify best.',
                    'Final raid spots are always decided by the raid lead for the specific raid. RRS is a score - It does not replace leadership.',
                ],
            },
        ],
    },
    {
        title: 'Loot Distribution',
        items: [
            {
                question: 'How is loot distributed?',
                answer: [
                    'Loot is handled through a mix of soft reserves, open rolls, main-spec priority, +1 balancing, and raid leadership discretion where needed. The goal is practical fairness: reward participation, keep progression moving, and avoid loot drama.',
                    <>
                        Detailed reserve rules are available on the <Link href="/terms" className="font-semibold text-gold hover:text-gold-100">terms and rules page</Link>.
                    </>,
                ],
            },
            {
                question: 'What happens to unreserved items?',
                answer: [
                    'Items that were not reserved are open for eligible participants to roll. Main Spec, Off Spec, and special cases are handled by the loot master based on the rules of that raid.',
                ],
            },
            {
                question: 'What is the +1 system?',
                answer: [
                    'The +1 system helps spread Main Spec loot more fairly over time. Winning a Main Spec item gives you a +1, which lowers your priority on later Main Spec rolls compared to players without a +1.',
                    'This does not remove your ability to roll. It simply prevents the same few players from repeatedly taking the highest-value Main Spec items while others receive nothing.',
                ],
            },
            {
                question: 'Who decides special loot cases?',
                answer: [
                    'Legendary items, BOEs, farming materials, quest items, repeated item drops, and exceptional cases can be decided by the loot master, guild master, or raid leader.',
                ],
            },
        ],
    },
    {
        title: 'Communication and Conduct',
        items: [
            {
                question: 'How should members communicate?',
                answer: [
                    'Use the tools provided: raid signup statuses, website chat synced with Discord, Discord messages, voice communication, and direct messages when needed.',
                    'If a raid lead needs to chase you for basic attendance information, you are already making planning harder than it needs to be.',
                ],
            },
            {
                question: 'What behavior is not accepted in the guild?',
                answer: [
                    'Drama farming, loot tantrums, repeated no-shows, ignoring communication, wasting raid time, disrespecting other members, and treating the guild like a backup plan are not accepted.',
                    'We are here to raid and enjoy the game. If someone consistently makes that harder for everyone else, they should not be surprised when we remove the problem.',
                ],
            },
            {
                question: 'What if I disagree with a decision?',
                answer: [
                    'Ask directly. All decisions can be explained. Some will not go your way. That is normal in a guild with limited raid spots, limited loot, and many people trying to progress together.',
                    'What matters is how you handle it. Mature feedback is welcome. Drama is not.',
                ],
            },
        ],
    },
];

function Answer({ content }: { content: React.ReactNode[] }) {
    return (
        <div className="mt-4 space-y-3 text-sm leading-6 text-ivory/85 md:text-base">
            {content.map((paragraph, index) => {
                const Component = typeof paragraph === 'string' ? () => <p>{paragraph}</p> : () => <>{paragraph}</>;
                return <Component key={index} />;
            })}
        </div>
    );
}

export default function Page() {
    return (
        <main className="w-full py-6 md:py-10">
            <PageEvent name="faq" />
            <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-3 md:px-6">
                <div className="faq-reveal relative overflow-hidden rounded-2xl border border-gold/70 bg-dark shadow-2xl shadow-black/50">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,168,102,0.24),transparent_34%),linear-gradient(135deg,rgba(62,92,79,0.45),transparent_42%)]" />
                    <div className="relative grid gap-6 p-5 md:grid-cols-[1.2fr_0.8fr] md:p-8">
                        <div className="space-y-4">
                            <p className="text-xs font-bold uppercase tracking-[0.35em] text-gold/80">Guild FAQ</p>
                            <h1 className="text-3xl font-black tracking-tight text-gold sm:text-4xl md:text-5xl">
                                Clear rules. Better raids. Less drama.
                            </h1>
                            <p className="max-w-3xl text-base leading-7 text-ivory/85 md:text-lg">
                                This page explains how Everlasting Vendetta recruits, raids, handles benches, distributes loot, and protects the group&apos;s time. The tone is direct because the goal is simple: we want reliable raids with people who respect each other.
                            </p>
                        </div>
                        <div className="rounded-xl border border-gold/40 bg-black/25 p-4">
                            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-gold">Core principles</h2>
                            <ul className="mt-4 space-y-3 text-sm text-ivory/85">
                                {principles.map((principle) => (
                                    <li key={principle} className="flex gap-3">
                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                                        <span>{principle}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="faq-reveal rounded-xl border border-moss-100 bg-moss/80 p-4 shadow-lg shadow-black/30" style={{ animationDelay: '80ms' }}>
                        <p className="text-2xl font-black text-gold">10 weeks</p>
                        <p className="mt-1 text-sm text-ivory/80">RRS looks at recent completed save weeks, weighted toward newer participation.</p>
                    </div>
                    <div className="faq-reveal rounded-xl border border-moss-100 bg-moss/80 p-4 shadow-lg shadow-black/30" style={{ animationDelay: '140ms' }}>
                        <p className="text-2xl font-black text-gold">1.0 score</p>
                        <p className="mt-1 text-sm text-ivory/80">Confirmed and Bench both count as full reliability participation.</p>
                    </div>
                    <div className="faq-reveal rounded-xl border border-moss-100 bg-moss/80 p-4 shadow-lg shadow-black/30" style={{ animationDelay: '200ms' }}>
                        <p className="text-2xl font-black text-gold">Don't vanish</p>
                        <p className="mt-1 text-sm text-ivory/80">Signing up and vanishing without communication wastes the raid&apos;s time.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {faqSections.map((section, sectionIndex) => (
                        <section
                            key={section.title}
                            className="faq-reveal rounded-2xl border border-wood-100 bg-wood-900/95 p-4 shadow-xl shadow-black/40 md:p-5"
                            style={{ animationDelay: `${280 + sectionIndex * 90}ms` }}
                        >
                            <h2 className="mb-4 text-2xl font-black text-gold">{section.title}</h2>
                            <div className="space-y-3">
                                {section.items.map((item, index) => (
                                    <article key={item.question} className="rounded-xl border border-moss-100 bg-dark/80 p-4">
                                        <h3 className="text-base font-bold text-ivory md:text-lg">{item.question}</h3>
                                        <Answer content={item.answer} />
                                    </article>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                <section className="faq-reveal rounded-2xl border border-gold bg-dark p-5 text-center shadow-2xl shadow-black/50 md:p-8" style={{ animationDelay: `${280 + faqSections.length * 90}ms` }}>
                    <h2 className="text-2xl font-black text-gold">Want in?</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-ivory/85 md:text-base">
                        If this sounds like the kind of guild you want to raid with, apply properly, communicate clearly, and come prepared. We do not need perfect players. We need reliable people.
                    </p>
                    <Link href="/apply" className="mt-5 inline-flex rounded-lg border border-gold bg-moss px-5 py-2 font-bold text-gold shadow-lg shadow-black/40 hover:bg-moss-100">
                        Apply to Everlasting Vendetta
                    </Link>
                </section>
            </section>
        </main>
    );
}
