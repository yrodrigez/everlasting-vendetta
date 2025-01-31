import Link from "next/link";
import {AchievementCard} from "@/app/roster/[name]/components/CharacterAchievements";
import createServerSession from "@utils/supabase/createServerSession";
import {cookies} from "next/headers";
import {ROLE} from "@utils/constants";
import NotLoggedInView from "@/app/components/NotLoggedInView";

export default async function AtieshMomentsPage() {
	const {auth} = await createServerSession({cookies});
	if (!auth) return <NotLoggedInView/>;

	const user = await auth.getSession();
	if (!user) return <NotLoggedInView/>;

	if (!user.roles.includes(ROLE.MODERATOR)) return null;

	return (
		<div
			className="min-h-full w-full text-primary flex flex-col items-center py-8 px-4 md:px-12 scrollbar-pill mb-8">
			{/* Page Title */}
			<h1 className="text-4xl md:text-5xl font-bold text-legendary mb-6 text-center">
				The Path to Atiesh:
				<span className="block text-gold text-xl md:text-2xl font-normal mt-2">
          Epic Moments in Our Guild’s Journey
        </span>
			</h1>

			{/* MOMENT I */}
			<section className="w-full max-w-4xl bg-wood-900 border border-gold rounded-lg shadow-gold p-6 mb-8">
				<h2 className="text-2xl md:text-3xl font-semibold text-gold mb-4">
					Moment I: The Gathering of the Worthy
				</h2>
				<p className="leading-relaxed">
					In the grand halls of our guild, only those who have proven themselves
					will be called forth to seek Atiesh. To stand among the Worthy, a hero
					must:
				</p>
				<ul className="list-disc list-inside mt-4 space-y-2 text-base md:text-lg pl-2">
					<li>Have served as a <strong>core raider</strong> for at least 2 months.</li>
					<li>Wear <strong>fully enchanted gear</strong> with best-in-slot enchantments.</li>
					<li>Show unyielding loyalty—no missed core raid resets without 1-day prior notice.</li>
					<li>
						Be a <strong>Mage, Warlock, Druid, or Priest</strong>.
					</li>
					<li>
						Answer the Raid Leader’s call and use at least one full set of world buffs
						whenever asked.
					</li>
				</ul>
			</section>

			{/* MOMENT II */}
			<section className="w-full max-w-4xl bg-wood-900 border border-gold rounded-lg shadow-gold p-6 mb-8">
				<h2 className="text-2xl md:text-3xl font-semibold text-gold mb-4">
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
						recipients (2nd, 3rd, etc.) are chosen <strong>randomly</strong>.
					</li>
					<li>
						Whichever hero currently gathers the Splinters of Atiesh is granted a
						<strong>+1 loot priority penalty</strong> each raid.
					</li>
					<li>
						As they forge this legendary staff, their <em>portrait</em> shall shine
						with a <strong
						className="text-moss shadow-legendary shadow rounded-lg bg-legendary p-1 border border-legendary ">legendary
						background</strong>&nbsp;on the guild’s website — so all know who carries the sacred burden.
					</li>
				</ul>
			</section>

			{/* MOMENT III */}
			<section className="w-full max-w-4xl bg-wood-900 border border-gold rounded-lg shadow-gold p-6 mb-8">
				<h2 className="text-2xl md:text-3xl font-semibold text-gold mb-4">
					Moment III: The Path of Dedication
				</h2>
				<p className="leading-relaxed">
					The journey to Atiesh demands unwavering devotion. Yet, unforeseen perils
					may test a hero’s ability to attend.
				</p>
				<ul className="list-disc list-inside mt-4 space-y-2 text-base md:text-lg pl-2">
					<li>
						Missing <strong>2 consecutive</strong> core raid resets drops a hero to
						the bottom of the queue.
					</li>
					<li>
						Missing <strong>3 total</strong> resets exiles them from the path entirely.
					</li>
					<li>
						<strong>Redemption Moment:</strong> A hero on the brink after missing two
						consecutive resets can <em>redeem</em> themselves at the next raid by
						gifting each raid member:
						<ul className="list-disc list-inside mt-2 ml-6 space-y-2">
							<li>3x of each small BiS consumable per class</li>
							<li>3x BiS food</li>
							<li>1x flask</li>
						</ul>
						Successful restitution keeps them on the path to Atiesh!
					</li>
				</ul>
			</section>

			{/* MOMENT IV */}
			<section className="w-full max-w-4xl bg-wood-900 border border-gold rounded-lg shadow-gold p-6 mb-8">
				<h2 className="text-2xl md:text-3xl font-semibold text-gold mb-4">
					Moment IV: Milestones on the Horizon
				</h2>
				<p className="leading-relaxed">
					As a hero collects Splinters in Naxxramas, the guild shall
					<strong> celebrate </strong> their progress:
				</p>
				<ul className="list-disc list-inside mt-4 space-y-2 text-base md:text-lg pl-2">
					<li>
						At <strong>10, 20, and 30 Splinters</strong>, a shout of triumph resounds
						through Discord or guild chat.
					</li>
					<li>
						Every step deserves applause—small victories ensure the guild’s morale
						remains high.
					</li>
				</ul>
			</section>

			{/* MOMENT V */}
			<section className="w-full max-w-4xl bg-wood-900 border border-gold rounded-lg shadow-gold p-6 mb-8">
				<h2 className="text-2xl md:text-3xl font-semibold text-gold mb-4">
					Moment V: The Gathering of the Guardian
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

			{/* MOMENT VI */}
			<section className="w-full max-w-4xl bg-wood-900 border border-gold rounded-lg shadow-gold p-6 mb-8">
				<h2 className="text-2xl md:text-3xl font-semibold text-gold mb-4">
					Moment VI: The Chosen One
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
						className="flex flex-col gap-4 md:gap-6 items-center w-full md:w-3/4 mx-auto mb-4"
					>
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
				</ul>
			</section>

			{/* EPILOGUE */}
			<section className="w-full max-w-4xl bg-wood-900 border border-gold rounded-lg shadow-gold p-6 mb-8">
				<h2 className="text-2xl md:text-3xl font-semibold text-gold mb-4">
					Epilogue: Guardianship & Legacy
				</h2>
				<p className="leading-relaxed">
					Should a champion depart our ranks or abandon their calling before
					Atiesh is complete, their lost Splinters return to legend, and the next
					champion takes up the burden. In times of emergency or other extenuating
					circumstances, officers may make fair decisions on a case-by-case basis.
				</p>
				<p className="leading-relaxed mt-4">
					Thus ends our account of the path to <strong>Atiesh</strong>. May your
					journey be marked by camaraderie, triumph, and the lasting pride of our
					guild’s unity.
				</p>
			</section>
		</div>
	);
}
