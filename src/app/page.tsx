import { Button } from "@/app/components/Button";
import LoopingVideo from "@/app/components/LoopingVideo";
import createServerSession from "@utils/supabase/createServerSession";
import { Metadata } from "next";


const intro = [
    {
        img: "/news/news-1.webp",
        header: "Welcome to Everlasting Vendetta",
        paragraphs: [
            "Embark on an epic journey with Everlasting Vendetta, a distinguished World of Warcraft guild where legends are forged and camaraderie reigns.",
        ]
    },
    {
        img: "/news/news-2.webp",
        header: "United by Legacy, Bound by Adventure",
        paragraphs: [
            "Our guild is more than just a group of gamers; we're a family bound by a shared love for the extraordinary worlds Blizzard has created.",
        ]
    },
    {
        img: "/news/news-3.webp",
        header: "Join Our Quest",
        paragraphs: [
            "Whether you're a seasoned raider, a strategic battleground commander, or a spirited newcomer eager to make your mark, you'll find a home here.",
        ]
    },
]

const CustomSection = ({ header, paragraphs, img }: { header: string, paragraphs: string[], img: string }) => {
    return (
        <div
            //isFooterBlurred
            className="border-none text-defaul bg-dark shadow-small w-80 min-h-[340px] rounded border-1 border-gold relative overflow-hidden"
        >
            <div
                className="w-80 h-[170px] bg-cover bg-center bg-no-repeat overflow-hidden shadow-small border border-gold/50 rounded-t border-b-0"
                style={{ backgroundImage: `url(${img})` }}
            ></div>
            <div
                className="p-3 scrollbar-pill flex-col bg-dark border-gold/50 min-h-[calc(50%)] border overflow-hidden py-2 absolute rounded rounded-t-none bottom-0 w-[calc(100%)] shadow-small z-10">
                <h1 className="font-bold text-xl text-gold self-start">{header}</h1>
                {paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
            </div>

        </div>
    )
}

export async function generateMetadata(): Promise<Metadata> {
    const metadataBase = new URL('https://www.everlastingvendetta.com/');

    return {
        title: `Everlasting Vendetta - Raids on Living Flame`,
        description: `Everlasting Vendetta is an active guild seeking raiders to join on the Living Flame server. Join us to conquer the greatest WoW challenges!`,
        keywords:
            'wow, world of warcraft, raids, upcoming raids, raiding, pve, guild events, Everlasting Vendetta',
        openGraph: {
            title: 'Upcoming Raids | Everlasting Vendetta',
            description:
                'Join Everlasting Vendetta in our upcoming raids. Prepare for epic encounters and secure your place in the battle!',
            images: [
                {
                    url: new URL('/banner.webp', metadataBase).toString(),
                    width: 800,
                    height: 600,
                    alt: 'Everlasting Vendetta Raid',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Upcoming Raids | Everlasting Vendetta',
            description:
                'Get ready for the upcoming raids organized by Everlasting Vendetta. Don’t miss out on the action!',
            images: new URL('/banner.webp', metadataBase).toString(),
        },
    };
}

export default async function Home() {
    const { auth } = await createServerSession();
    const session = await auth.getSession()

    return (
        <main className="flex w-full h-full justify-evenly flex-col">
            <div className="hidden lg:block h-full w-full">
                <div className="absolute top-2 right-4 flex flex-col z-50">
                    {/* will be shown in top right */}
                </div>
                <div className={
                    "absolute bottom-[51%] left-0 w-full top-0 bg-cover bg-center bg-no-repeat backdrop-filter backdrop-blur-md border-bottom-image"
                } style={{ backgroundImage: "url('/banner-cropped.webp')" }}>
                    <div className="absolute top-0 left-0 w-full h-full -z-10 ">
                        {<LoopingVideo />}
                    </div>
                    <div
                        className="flex flex-col items-center justify-center h-full w-full bg-black bg-opacity-50">
                        <div
                            className="flex flex-col items-center justify-center bg-opacity-100 opacity-100">
                            <img alt={'center-img'} src={`/center-img.webp`}
                                className="flex-1 rounded-full w-60" />
                            {!session &&
                                <Button 
                                as='a' 
                                href="/apply" 
                                className="mt-4 glow-animation border-gold"
                                size="lg"
                                >Apply Now</Button>}
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="flex flex-col h-full p-2 gap-3 items-center lg:flex-row lg:flex-wrap lg:items-start lg:justify-center lg:max-w-[1000px]">
                {intro.map((section, index) => <CustomSection key={index} {...section} />)}
            </div>
        </main>
    );
}
