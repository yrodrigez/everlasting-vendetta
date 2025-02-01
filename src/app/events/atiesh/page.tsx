import Link from "next/link";
import {AchievementCard} from "@/app/roster/[name]/components/CharacterAchievements";
import createServerSession from "@utils/supabase/createServerSession";
import {cookies} from "next/headers";
import {ROLE} from "@utils/constants";
import NotLoggedInView from "@/app/components/NotLoggedInView";
import {ScrollShadow} from "@nextui-org/react";
import Sound from "@/app/events/components/Sound";
import ParticipateButton from "@/app/events/components/ParticipateButton";
import GearScore from "@/app/components/GearScore";
export const dynamic = 'force-dynamic'

const Splinter = () => (
    <span className="text-legendary inline-flex gap-2 items-center">
        <img src="https://wow.zamimg.com/images/wow/icons/large/inv_qiraj_jewelblessed.jpg"
             className="w-[15px] h-[15px]"
             alt="Splinter of Atiesh"/>
        <Link href="https://www.wowhead.com/classic/item=22726" target="_blank">
            [Splinter of Atiesh]
        </Link>
    </span>
);

const ItemLink = ({id, name, img, rarity}: { id: number, name: string, img: string, rarity: string }) => (
    <span className={`text-${rarity} inline-flex gap-2 items-center`}>
        <img src={img} className="w-[15px] h-[15px]" alt={name}/>
        <Link href={`https://www.wowhead.com/classic/item=${id}`} target="_blank">
            [{name}]
        </Link>
    </span>
);
async function fetchGearScore(characterName: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL!}/api/v1/services/member/character/${encodeURIComponent(characterName.toLowerCase())}/gs`)

    if (!response?.ok) return {gs: 0, color: 'gray', isFullEnchanted: false};

    try {
        const {gs, color, isFullEnchanted} = await response.json();
        return !!isFullEnchanted;
    } catch (e) {
        console.error('Error parsing response', e);
        return {gs: 0, color: 'gray', isFullEnchanted: false};
    }
}
export default async function AtieshMomentsPage() {
    const {auth, supabase} = await createServerSession({cookies});
    if (!auth) return <NotLoggedInView/>;

    const user = await auth.getSession();


    const isRoleAllowed = user?.roles?.includes(ROLE.RAIDER) || user?.roles?.includes(ROLE.COMRADE) || user?.roles?.includes(ROLE.GUILD_MASTER);
    const isClassAllowed = ['Mage', 'Warlock', 'Druid', 'Priest'].includes(user?.character_class?.name ?? '');
    const {
        data: participants,
        error: errorParticipants
    } = await supabase.from('guild_events_participants').select('member_id,position, event:guild_events!inner(name,id), member:ev_member!inner(character)').eq('event.name', 'Atiesh').order('position', {ascending: true}).returns<{
        position: number;
        event: { name: string, id: number };
        member: { character: { id: number, name: string, avatar: string, character_class: { name: string } } };
        member_id: number;
    }[]>()
    const {
        data: event,
        error: errorEvent
    } = await supabase.from('guild_events').select('*').eq('name', 'Atiesh').limit(1).maybeSingle();

    const isParticipating = participants?.find((x: { member_id: number }) => x.member_id === user?.id);
    const isFullEnchanted = false //(user?.name ? (await fetchGearScore(user.name)) : false);

    return (
        <ScrollShadow
            size={20}
            className="min-h-full w-full text-primary flex flex-col items-center scrollbar-pill">
            <div className="sticky top-2  ml-auto mt-2">
                <Sound sound={'/sounds/naxxramas.mp3'}/>
            </div>
            {/* Page Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-legendary mb-6 text-center">
                The Path to Atiesh:
            </h1>

            {/* MOMENT I */}
            <section className="w-full max-w-4xl bg-wood-900 border border-gold rounded-lg shadow-gold p-6 mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-4 sticky top-2 bg-wood-900 py-2">
                    Moment I: The Gathering of the Worthy
                </h2>
                <p className="leading-relaxed">
                    In the grand halls of our guild, only those who have proven themselves
                    will be called forth to seek Atiesh. To stand among the Worthy, a hero
                    must:
                </p>
                <ul className="list-disc list-inside mt-4 space-y-2 text-base md:text-lg pl-2">
                    <li>Have served as a <strong>core raider</strong> and have been part of the guild for at least 2
                        months.
                    </li>
                    <li>Have <strong>fully enchanted gear</strong> with best-in-slot enchantments.</li>
                    <li>Show no missed core raid resets without 1-day prior notice.</li>
                    <li>
                        Be a <strong><span className="text-mage">Mage</span>, <span
                        className="text-warlock">Warlock</span>, <span className="text-druid">Druid</span>, or <span
                        className="text-priest">Priest</span></strong>.
                    </li>
                    <li>
                        The member who is active farming the <Splinter/> will arrive each week armed with a full
                        set of world buffs for Naxxramas (at least 1 of each):
                        <ul className="list-disc list-inside mt-2 ml-6 space-y-2">
                            <li className="text-rare flex gap-2 items-center">
                                <img src="https://wow.zamimg.com/images/wow/icons/tiny/inv_misc_horn_03.gif"
                                     className="w-[15px] h-[15px]"
                                     alt="Horn of the Dawn"/>
                                <Link href="https://www.wowhead.com/classic/item=233198" target="_blank">
                                    [Horn of the Dawn]
                                </Link>
                            </li>
                            <li className="text-rare flex gap-2 items-center">
                                <img src="https://wow.zamimg.com/images/wow/icons/tiny/inv_misc_herb_dreamingglory.gif"
                                     className="w-[15px] h-[15px]"
                                     alt="Songflower Seed"/>
                                <Link href="https://www.wowhead.com/classic/item=233200" target="_blank">
                                    [Songflower Seed]
                                </Link>
                            </li>
                            <li className="text-rare flex gap-2 items-center">
                                <img src="https://wow.zamimg.com/images/wow/icons/tiny/inv_elemental_primal_water.gif"
                                     className="w-[15px] h-[15px]"
                                     alt="Shimmering Globe"/>
                                <Link href="https://www.wowhead.com/classic/item=233201" target="_blank">
                                    [Shimmering Globe]
                                </Link>
                            </li>
                            <li className="text-rare flex gap-2 items-center">
                                <img src="https://wow.zamimg.com/images/wow/icons/tiny/inv_misc_coin_14.gif"
                                     className="w-[15px] h-[15px]"
                                     alt="Spirit Conch"/>
                                <Link href="https://www.wowhead.com/classic/item=233211" target="_blank">
                                    [Spirit Conch]
                                </Link>
                            </li>
                            <li className="text-rare flex gap-2 items-center">
                                <img src="https://wow.zamimg.com/images/wow/icons/tiny/trade_blacksmithing.gif"
                                     className="w-[15px] h-[15px]"
                                     alt="Overseer's Anvil"/>
                                <Link href="https://www.wowhead.com/classic/item=233206" target="_blank">
                                    [Overseer's Anvil]
                                </Link>
                            </li>
                            <li className="text-rare flex gap-2 items-center">
                                <img src="https://wow.zamimg.com/images/wow/icons/tiny/inv_misc_orb_02.gif"
                                     className="w-[15px] h-[15px]"
                                     alt='"Defective" Magic 8-Ball'/>
                                <Link href="https://www.wowhead.com/classic/item=233208" target="_blank">
                                    ["Defective" Magic 8-Ball]
                                </Link>
                            </li>
                        </ul>
                    </li>
                </ul>
                <div className="text-xs text-gold mt-4 p-2 border-t border-gold">
                    <span>
                        <strong>Note:</strong> You can also send the gold or mats to get the Commendation Signets to the guild bank.
                    </span>
                </div>
            </section>

            {/* MOMENT II */}
            <section className="w-full max-w-4xl bg-wood-900 border border-gold rounded-lg shadow-gold p-6 mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-4 sticky top-2 bg-wood-900 py-2">
                    Moment II: The Great Queue
                </h2>
                <p className="leading-relaxed">
                    The first champion has already been chosen —
                    <Link href={'/roster/felsargon'}><strong className="text-gold"> Felsargon</strong></Link>, honored
                    for his
                    tireless leadership in MC, BWL, and AQ. When the time comes for the second
                    and third Atiesh to arise, fate will decide from among the Worthy.
                </p>
                <ul className="list-disc list-inside mt-4 space-y-2 text-base md:text-lg pl-2">
                    <li>
                        A <strong>queue</strong> of eligible heroes shall be made, and the next
                        recipients (2nd, 3rd, etc.) will be chosen <strong>randomly</strong> on Wednesday February 5th after <Link href="/raid/9949dcb1-28c1-417d-ae37-db1cbaf417c6" className="font-bold text-epic" target="_blank">Temple of AQ raid</Link> so make sure to be there!
                    </li>
                    <li>
                        Whichever hero currently farming the <Splinter/> is granted a&nbsp;<strong>+0.5 loot priority
                        penalty</strong> each raid.
                    </li>
                    <li>
                        As they forge this legendary staff, their <em>portrait</em> shall shine
                        with a <span
                        className="text-white shadow-legendary shadow rounded-lg bg-legendary p-1 border border-legendary ">legendary
                        background</span>&nbsp;on the guild’s website — so all know who carries the sacred burden.
                    </li>
                </ul>
                <div className="text-xs text-gold mt-4 p-2 border-t border-gold">
                    <span>
                        <strong>Note:</strong> 0.5 loot priority penalty is less than a +1 loot priority penalty but more than a 0 loot priority. <br/>As always, the loot council will decide the loot distribution and this <Link href="/terms" target="_blank"><strong>does not affects reserves</strong></Link>.
                        <br/><br/>
                        <strong>Note 2:</strong> Orders will be decided by the RNG site <Link href="https://www.random.org/lists/" target="_blank">random.org</Link>.
                    </span>
                </div>
            </section>

            {/* MOMENT III */}
            <section
                className="w-full max-w-4xl bg-wood-900 border border-gold rounded-lg shadow-gold p-6 mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-4 sticky top-2 bg-wood-900 py-2">
                    Moment III: The Path of Dedication
                </h2>
                <p className="leading-relaxed mb-4">
                    The journey to Atiesh demands unwavering devotion. Yet, unforeseen perils may test a hero’s ability
                    to attend.
                </p>
                <ul className="list-disc list-inside mt-4 space-y-4 text-base md:text-lg pl-2">
                    <li>
                        Participating members missing <strong>two back-to-back</strong> raids must perform a Redemption
                        Moment at the next raid or be stripped of their place in line.
                    </li>
                    <li>
                        If the same hero misses a <strong>third</strong> reset (even if not consecutive), their place is
                        forfeit—they are cast to the bottom of the queue.
                    </li>
                    <li>
                        <strong>Missing a Raid & Splinter Transfer:</strong> If the designated Splinter farmer fails to attend a raid,
                        the responsibility for receiving <Splinter/> will automatically pass to the next eligible member in the queue.
                        Furthermore, if any queued member’s cumulative Splinter count exceeds that of the current farmer by at least <strong>10</strong>,
                        that member will assume the role of active Splinter farmer.
                    </li>
                    <li>
                        <span className="font-bold text-gold mb-1">Redemption Moment:</span>
                        <p className="leading-relaxed">
                            A hero on the brink after missing two consecutive resets can <em>redeem</em> themselves at
                            the next raid by gifting each raid member <strong>1 flask</strong> of their choice:
                        </p>
                        <ul className="list-disc list-inside mt-2 ml-6 space-y-2 flex flex-col">
                            {[
                                {
                                    id: 233964,
                                    name: 'Flask of Ancient Knowledge',
                                    img: 'https://wow.zamimg.com/images/wow/icons/large/inv_alchemy_endlessflask_04.jpg',
                                    rarity: 'common',
                                },
                                {
                                    id: 233962,
                                    name: 'Flask of Madness',
                                    img: 'https://wow.zamimg.com/images/wow/icons/large/inv_alchemy_endlessflask_06.jpg',
                                    rarity: 'common',
                                },
                                {
                                    id: 233965,
                                    name: 'Flask of the Old Gods',
                                    img: 'https://wow.zamimg.com/images/wow/icons/large/inv_alchemy_endlessflask_05.jpg',
                                    rarity: 'common',
                                },
                                {
                                    id: 233966,
                                    name: 'Flask of Unyielding Sorrow',
                                    img: 'https://wow.zamimg.com/images/wow/icons/large/inv_alchemy_endlessflask_03.jpg',
                                    rarity: 'common',
                                },
                            ].map((x) => (
                                <ItemLink key={x.id} {...x} />
                            ))}
                        </ul>
                        <p className="mt-2">
                            Successful restitution keeps them on the path to Atiesh!
                        </p>
                    </li>

                </ul>
                <div className="text-xs text-gold mt-4 p-2 border-t border-gold">
                    <span className="inline-flex items-center gap-1">
                      <strong>Note:</strong> This applies to every member participating in the Atiesh guild event and/or actively farming the <Splinter/>.
                    </span>
                    <br/>
                    <span>
                      Example: If you are 3<sup>rd</sup> in the queue and you miss 3 core raid resets, you will be dropped to the bottom of the queue.
                    </span>
                </div>
            </section>


            {/* MOMENT IV */}
            <section className="w-full max-w-4xl bg-wood-900 border border-gold rounded-lg shadow-gold p-6 mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-4  sticky top-2 bg-wood-900 py-2">
                    Moment IV: The Gathering of the Guardian
                </h2>
                <p className="leading-relaxed">
                    When a champion at last holds 40 Splinters, the final chapter awaits:
                </p>
                <ul className="list-disc list-inside mt-4 space-y-2 text-base md:text-lg pl-2">
                    <li>
                        The guild unites for a <strong>Stratholme run</strong> to confront
                        the spirit within Atiesh.
                    </li>
                    <li>
                        Upon victory, a <strong>ceremonial screenshot</strong> captures the
                        staff’s cleansing, forever <em>preserved</em> on the guild’s website.
                    </li>
                </ul>
            </section>

            {/* MOMENT V */}
            <section className="w-full max-w-4xl bg-wood-900 border border-gold rounded-lg shadow-gold p-6 mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-4 sticky top-2 bg-wood-900 py-2">
                    Moment V: The Chosen One
                </h2>
                <p className="leading-relaxed">
                    At the culmination of this saga, the newly anointed wielder of Atiesh is
                    celebrated:
                </p>
                <ul className="list-disc list-inside mt-4 space-y-2 text-base md:text-lg pl-2">
                    <li>
                        Receive the achievement:
                    </li>
                    <div
                        className="w-full justify-center flex">
                        <div className="transform hover:scale-125 transition-transform duration-300 ease-in-out">
                            <AchievementCard
                                achievement={{
                                    name: 'The Chosen One',
                                    points: 100,
                                    description: 'You have forged Atiesh, Greatstaff of the Guardian! Legends will be told, worlds will tremble… and now everyone’s expecting you to summon a portal on demand.',
                                    img: 'https://ijzwizzfjawlixolcuia.supabase.co/storage/v1/object/public/achievement-image/e464c747-64a4-4f19-af97-8cd17cf8e46d.webp',
                                    condition: {},
                                    category: 'raid',
                                    created_at: '2022-01-01T00:00:00Z',
                                }}
                                isAchieved={true}
                            />
                        </div>
                    </div>
                </ul>
            </section>
            <section className="w-full max-w-4xl bg-wood-900 border border-gold rounded-lg shadow-gold p-6 mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-gold mb-4 py-2">
                    Participate in the Atiesh Event
                </h2>
                <div className="flex w-full justify-center items-center gap-4">

                    {!!user ? (
                        <div className="flex flex-col w-full gap-4 items-center justify-center">
                            <div className="flex gap-2 items-center">
                                <img src={user.avatar}
                                     className={`w-12 h-12 rounded-full border border-gold ${!isClassAllowed || !isRoleAllowed ? 'grayscale' : ''} `}
                                     alt="User Avatar"/>
                                <span className="text-gold font-semibold">{user.name}</span>
                            </div>
                            {isParticipating ? (
                                <div className="text-gold">You are already participating in the Atiesh event.</div>
                            ) : isClassAllowed && isRoleAllowed && isFullEnchanted ? (
                                <ParticipateButton sound="/sounds/KelThuzad.ogg"
                                                   eventId={event?.id}
                                >
                                    Participate
                                </ParticipateButton>
                            ) : (
                                <div className="text-gold">You are not eligible to participate in the Atiesh event due
                                    to {
                                        !isClassAllowed && !isRoleAllowed ? 'your class and role. ' :
                                            !isClassAllowed ? 'your class (' + user.character_class.name + ').' :
                                                !isRoleAllowed ? 'you are not a Core raider' :
                                                !isFullEnchanted ? 'your gear is not fully enchanted.' :
                                                    'an unknown reason.'
                                    }</div>
                            )}
                        </div>
                    ): (
                        <NotLoggedInView hideTitle/>
                    )}
                    <div className="flex flex-col gap-2 items-center w-full max-h-[300px]">
                        <span className="text-gold text-2xl font-semibold">Participants</span>
                        <ScrollShadow size={20} className="w-full max-h-[300px] min-h-[100px] scrollbar-pill p-5">
                            {participants?.length === 0 ? (
                                <div className="text-gold">No participants yet.</div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2">
                                    {participants?.map((x) => (
                                        <div key={x.member_id}
                                             className={`flex gap-2 items-center justify-between bg-wood-800 border border-gold rounded-lg ${x.position === 1 ? 'shadow shadow-legendary' : ''} p-3`}>
                                            <img src={x.member.character.avatar}
                                                 className="w-8 h-8 rounded-full border border-gold"
                                                 alt={x.member.character.name}/>
                                            <span className="text-gold">{x.member.character.name}</span>
                                            <GearScore characterName={x.member.character.name}
                                                       allowForce={user?.roles?.includes(ROLE.GUILD_MASTER) || user?.name === x.member.character.name}/>
                                            <span className="text-gold ">position: {x.position}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollShadow>
                    </div>
                </div>
                <div className="text-xs text-gold mt-4 p-2 border-t border-gold">
                                        <span className="inline-flex items-center gap-1">
                                        <strong>Note:</strong> if you are not eligible to participate, please contact an officer for more information.
                                        </span>
                </div>
            </section>
        </ScrollShadow>
    );
}
