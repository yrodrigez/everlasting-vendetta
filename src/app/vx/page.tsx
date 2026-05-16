import NotLoggedInView from "@/components/NotLoggedInView";
import { SomethingWentWrong } from "@/components/something-went-wrong";
import { PageEvent } from "@/hooks/usePageEvent";
import { ROLE } from "@/util/constants";
import createServerSession from "@/util/supabase/createServerSession";
import { Cinzel } from "next/font/google";
import VxExchange from "./components/vx-exchange";
import type { Metadata } from "next";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Vendetta Exchange",
    description: "Vendetta Exchange is the guild prediction market for Everlasting Vendetta members.",
    robots: { index: false, follow: false },
};

export default async function VxPage() {
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

    const isGuildMaster = (session.roles?.includes(ROLE.GUILD_MASTER) || session.roles?.includes(ROLE.VX_ADMIN)) ?? false;

    return (
        <>
            <PageEvent name="vx_page_view" />
            <VxExchange
                headingClassName={cinzel.className}
                isGuildMaster={isGuildMaster}
            />
        </>
    );
}
