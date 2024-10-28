import {ChatContainer} from "@/app/raid/[id]/chat/components/ChatContainer";
import {Button} from "@/app/components/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import {cookies} from "next/headers";
import NotLoggedInView from "@/app/components/NotLoggedInView";
import React from "react";
import createServerSession from "@utils/supabase/createServerSession";
import {BnetLoginButton} from "@/app/components/BnetLoginButton";

export const dynamic = 'force-dynamic'

export default async function ({params}: { params: { id: string } }) {
    if (!params.id) return null

    const {auth} = createServerSession({cookies})
    if (!auth) {
        return (
            <NotLoggedInView/>

        )
    }

    const user = await auth.getSession()
    if (!user) {
        return (
            <NotLoggedInView/>
        )
    }
    if (user.source !== 'bnet_oauth') {
        return (
            <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
                <h1>Only Blizzard OAuth users can access this chat</h1>
                <BnetLoginButton/>
                <Link
                    href={`/raid/${params.id}`}
                    scroll={false}
                >
                    <Button>
                        <FontAwesomeIcon icon={faArrowLeft}/> Back
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="w-full h-full flex flex-col gap-2 relative items-center justify-center">
            <ChatContainer resetId={params.id}/>
            <div
                className="absolute top-0 left-0 flex flex-col gap-2">
                <Link
                    href={`/raid/${params.id}`}
                    scroll={false}
                >
                    <Button isIconOnly>
                        <FontAwesomeIcon icon={faArrowLeft}/>
                    </Button>
                </Link>
            </div>
        </div>
    );
}
