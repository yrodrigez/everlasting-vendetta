'use client'
import {HeaderMenuButton} from "@/app/components/HeaderMenuButton";
import {usePathname, useRouter} from "next/navigation";
import useScreenSize from "@/app/hooks/useScreenSize";
import {createHandleAuthMessage, openAuthWindow} from "@/app/util/blizzard/loginOnWindow";

export const LoginButton = ({battleNetRedirectUrl}: { battleNetRedirectUrl: string }) => {
    const path = usePathname()
    const {isDesktop} = useScreenSize()
    const loginUrl = `${battleNetRedirectUrl}${path ? `?redirectedFrom=${encodeURIComponent(path)}${isDesktop ? '&windowOpener=true' : ''}` : ''}`
    const router = useRouter()

    return (
        <HeaderMenuButton
            onClick={isDesktop ? () => {
                const authWin = openAuthWindow(loginUrl, 'BattleNet Login', 600, 880);
                const handleAuthMessage = (event: MessageEvent) => createHandleAuthMessage(event, () => {
                    authWin?.close();
                    router.refresh();
                    window.removeEventListener('message', handleAuthMessage);
                })

                window.addEventListener('message', handleAuthMessage);
            } : undefined}
            text="Login"
            url={loginUrl}/>
    )
}
