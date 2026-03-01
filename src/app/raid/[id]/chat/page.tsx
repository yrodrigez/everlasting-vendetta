import { BnetLoginButton } from "@/app/components/BnetLoginButton";
import { Button } from "@/app/components/Button";
import NotLoggedInView from "@/app/components/NotLoggedInView";
import { ChatContainer } from "@/app/raid/[id]/chat/components/ChatContainer";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import createServerSession from "@utils/supabase/createServerSession";
import Link from "next/link";

export const dynamic = 'force-dynamic'

export default async function ({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    if (!id) return null

    const { auth, getSupabase } = await createServerSession();
    if (!auth) {
        return (
            <NotLoggedInView />
        )
    }

    const user = await auth.getSession()
    if (!user) {
        return (
            <NotLoggedInView />
        )
    }

    const supabase = await getSupabase()
    const { data, error } = await supabase
        .from('raid_resets')
        .select('raid:ev_raid(name), realm')
        .eq('id', id)
        .single()
        .overrideTypes<{ raid: { name: string }, realm: string }>()
    if (error || !data) {
        return (
            <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
                <h1>Raid not found</h1>
                <Link
                    href={`/raid/${id}`}
                    scroll={false}
                >
                    <Button>
                        <FontAwesomeIcon icon={faArrowLeft} /> Back
                    </Button>
                </Link>
            </div>
        )
    }

    if (user?.provider?.indexOf('oauth') !== -1) {
        return (
            <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
                <h1>Only Blizzard OAuth users can access this chat</h1>
                <BnetLoginButton />
                <Link
                    href={`/raid/${id}`}
                    scroll={false}
                >
                    <Button>
                        <FontAwesomeIcon icon={faArrowLeft} /> Back
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="w-full h-full flex flex-col gap-2 relative items-center justify-center">
            <ChatContainer resetId={id} realmslug={data.realm} raidName={data.raid.name} />
            <div
                className="absolute top-0 left-0 flex flex-col gap-2">
                <Link
                    href={`/raid/${id}`}
                    scroll={false}
                >
                    <Button isIconOnly>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
