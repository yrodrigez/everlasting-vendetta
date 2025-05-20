import {BnetLoginButton} from "@/app/components/BnetLoginButton";

import {TemporalLogin} from "@/app/raid/components/TemporalLogin";

export default function NotLoggedInView({hideTitle = false}: { hideTitle?: boolean }) {

    return (
        <div className={'flex flex-col gap-2 w-full h-full items-center justify-center'}>
            {hideTitle ? null : <h1 className={'text-4xl text-center'}>You must be logged in to view this page</h1>}
            <div className="flex gap-2 items-center justify-center flex-col">
                <BnetLoginButton/>
                <div
                    className="flex gap-2 items-center justify-center"
                >
                    <div
                        className="border-t border-gray-300 w-full min-w-32"/>

                    <span>or</span>
                    <div
                        className="border-t border-gray-300 w-full min-w-32"
                    />
                </div>
                <TemporalLogin/>
            </div>
        </div>
    )
}
