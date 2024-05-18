
import {BnetLoginButton} from "@/app/components/BnetLoginButton";

export default function NotLoggedInView() {

    return (
        <div className={'flex flex-col gap-2 w-full h-full items-center justify-center'}>
            <h1 className={'text-4xl text-center'}>You must be logged in to view this page</h1>
            <BnetLoginButton/>
        </div>
    )
}
