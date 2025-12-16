import { BnetLoginButton } from "@/app/components/BnetLoginButton";
import { DiscordLoginButton } from "@/app/components/DiscordLoginButton";

import { TemporalLogin } from "@/app/raid/components/TemporalLogin";

export default function NotLoggedInView({ hideTitle = false }: { hideTitle?: boolean }) {

    return (
        <div className={'flex flex-col gap-2 w-full h-full items-center justify-center'}>
            {hideTitle ? null : <h1 className={'text-4xl text-center'}>You must be logged in to view this page</h1>}
            <div className="flex gap-2 items-center justify-center flex-col mt-6 w-full lg:w-1/3">
                <BnetLoginButton />
                <DiscordLoginButton />
                <div
                    className="flex gap-2 items-center justify-center w-full"
                >
                    <div
                        className="border-t border-gray-300 w-full min-w-32" />

                    <span>or</span>
                    <div
                        className="border-t border-gray-300 w-full min-w-32"
                    />
                </div>
                <TemporalLogin />
            </div>
        </div>
    )
}
