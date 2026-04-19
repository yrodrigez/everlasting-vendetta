import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    const metadataBase = new URL(process.env.NEXT_PUBLIC_BASE_URL!);

    return {
        title: 'Upcoming Raids | Everlasting Vendetta',
        description:
            'Check out the upcoming raids organized by Everlasting Vendetta. Join us for epic battles and adventures in World of Warcraft!',
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