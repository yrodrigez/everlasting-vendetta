import NotLoggedInView from "@/components/NotLoggedInView";
import { SomethingWentWrong } from "@/components/something-went-wrong";
import { PageEvent } from "@/hooks/usePageEvent";
import createServerSession from "@/util/supabase/createServerSession";
import { Cinzel } from "next/font/google";
import type { Metadata } from "next";
import VxLeaderboard from "./components/vx-leaderboard";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "VX Leaderboard",
    description: "Vendetta Exchange leaderboard for Everlasting Vendetta members.",
    robots: { index: false, follow: false },
};

export default async function VxLeaderboardPage() {
    const { auth } = await createServerSession();
    const session = await auth.getSession();

    if (!session?.id) {
        return <NotLoggedInView />;
    }

    if (session.isBanned || !session.isGuildMember) {
        return (
            <SomethingWentWrong
                header="Access denied"
                subheader="Vendetta Exchange is reserved for active Everlasting Vendetta guild members."
                body={<p className="text-center text-primary/80">If this looks wrong, refresh after logging in with the account tied to your guild character.</p>}
            />
        );
    }

    return (
        <>
            <PageEvent name="vx_leaderboard_view" />
            <VxLeaderboard headingClassName={cinzel.className} />
        </>
    );
}
