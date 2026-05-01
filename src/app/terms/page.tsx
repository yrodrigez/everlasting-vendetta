import ShowReserveRules from "@/app/raid/[id]/soft-reserv/ShowReserveRules";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Terms & Rules | Everlasting Vendetta",
    description: "Terms and rules for soft reservation loot distribution in Everlasting Vendetta raids.",
    openGraph: {
        title: "Terms & Rules | Everlasting Vendetta",
        description: "Terms and rules for soft reservation loot distribution in Everlasting Vendetta raids.",
    },
    twitter: {
        card: 'summary',
    },
};

export default async function Page() {
    return <ShowReserveRules shouldAlwaysOpen={true}/>
}
