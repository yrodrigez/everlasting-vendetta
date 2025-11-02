'use client'
import { HeaderMenuButton } from "@/app/components/HeaderMenuButton";
import { usePathname, useRouter } from "next/navigation";
import useScreenSize from "@/app/hooks/useScreenSize";
import { createHandleAuthMessage, openAuthWindow } from "@/app/util/blizzard/loginOnWindow";
import { DISCORD_LOGIN_URL } from "@utils/constants";
import { useState, useRef, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { Button } from "@/app/components/Button";
import { AnimatedModal } from "@/app/components/AnimatedModal";


export const LoginButton = ({ battleNetRedirectUrl }: { battleNetRedirectUrl: string }) => {
    const path = usePathname()
    const { isDesktop } = useScreenSize()
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef<HTMLDivElement>(null)
    const router = useRouter();

    const battleNetLoginUrl = useMemo(() => {
        return `${battleNetRedirectUrl}${path ? `?redirectedFrom=${encodeURIComponent(path)}${isDesktop ? '&windowOpener=true' : ''}` : ''}`
    }, [battleNetRedirectUrl, path, isDesktop]);
    const discordLoginUrl = useMemo(() => {
        return `${DISCORD_LOGIN_URL}${path ? `?redirectedFrom=${encodeURIComponent(path)}${isDesktop ? '&windowOpener=true' : ''}` : ''}`
    }, [DISCORD_LOGIN_URL, path, isDesktop]);

    const handleLogin = useCallback((url: string, windowTitle: string) => {
        if (isDesktop) {
            const authWin = openAuthWindow(url, windowTitle, 600, 880);
            const handleAuthMessage = (event: MessageEvent) => createHandleAuthMessage(event, () => {
                authWin?.close();
                window.removeEventListener('message', handleAuthMessage);
                // Use full page reload to ensure middleware runs and session is updated
                window.location.reload();
            })
            window.addEventListener('message', handleAuthMessage);
        } else {
            window.location.href = url;
        }
        setIsOpen(false);
    }, [isDesktop, openAuthWindow, createHandleAuthMessage]);

    return (
        <>
            <div
                ref={buttonRef}
                style={{
                    opacity: isOpen ? 0 : 1,
                    transition: 'opacity 300ms ease-out',
                    pointerEvents: isOpen ? 'none' : 'auto'
                }}
            >
                <HeaderMenuButton text="Login" onClick={() => setIsOpen(true)} />
            </div>

            <AnimatedModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                triggerRef={buttonRef}
                title="Login to Everlasting Vendetta"
            >
                <div className="flex flex-col gap-3">
                    <Button
                        onPress={() => handleLogin(battleNetLoginUrl, 'Battle.net Login')}
                        className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-battlenet transition-colors border border-battlenet/30 bg-battlenet text-white"
                        startContent={
                            <span className="font-xl text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" stroke="currentColor"
                                    strokeLinecap="round" strokeLinejoin="round" strokeWidth="0" viewBox="0 0 48 48"
                                    className={'w-8 h-8'}
                                    style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                    <path stroke="none"
                                        d="M38.016 18.29c1.23-3.787 1.462-7.242.623-9.859l-.024-.073c-.05-.142-.175-.442-.334-.442-.12 0-.122.201-.115.303l.007.059c.267 2.337-.448 5.671-1.884 9.162-2.947-1.338-6.487-2.407-10.413-3.037-3.529-.567-6.906-.692-9.97-.442.364-2.41 1.264-4.086 2.74-4.44 2.033-.486 4.25.851 6.364 3.284q.547.075 1.097.163 1.564.25 3.072.596c-3.854-7.249-9.023-11.312-12.954-9.812-2.992 1.14-4.52 5.256-4.338 10.788-3.896.829-7.003 2.355-8.85 4.39l-.051.057c-.098.115-.296.373-.216.51.06.105.235.006.32-.051l.047-.036c1.89-1.4 5.135-2.448 8.877-2.949.315 3.22 1.16 6.82 2.576 10.536 1.274 3.34 2.854 6.327 4.603 8.855-2.27.89-4.17.948-5.215-.154-1.438-1.516-1.39-4.104-.339-7.152q-.21-.51-.408-1.032a48 48 0 0 1-1.019-2.957c-4.352 6.962-5.285 13.47-2.021 16.125 2.483 2.02 6.812 1.286 11.512-1.638 2.666 2.96 5.541 4.888 8.227 5.47l.075.016c.148.027.47.069.55-.069.06-.104-.113-.206-.205-.251l-.054-.023c-2.158-.937-4.688-3.223-6.993-6.213 2.632-1.883 5.327-4.414 7.836-7.499 2.256-2.773 4.053-5.635 5.368-8.414 1.905 1.52 2.906 3.138 2.474 4.594-.594 2.003-2.86 3.255-6.024 3.869q-.339.436-.69.869-1 1.23-2.052 2.361c8.205.288 14.307-2.158 14.975-6.312.508-3.16-2.293-6.543-7.174-9.151m-7.127 8.286c-2.893 3.557-6.5 6.586-9.707 8.337a36.3 36.3 0 0 1-3.091-6.183c-1.634-4.285-2.454-8.922-2.366-12.575 2.28-.076 4.635.05 6.9.414 4.527.727 8.953 2.336 12.073 4.239a36.3 36.3 0 0 1-3.809 5.768"></path>
                                </svg>
                            </span>}
                    >
                        <span>Login with Battle.net</span>
                    </Button>
                    <Button
                        isDisabled={true}
                        onPress={() => handleLogin(discordLoginUrl, 'Discord Login')}
                        className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-discord transition-colors border border-discord/30 bg-discord text-white"
                    >
                        <FontAwesomeIcon icon={faDiscord} className="w-6 h-6 text-white" />
                        <span>Login with Discord</span>
                    </Button>
                </div>
            </AnimatedModal>
        </>
    )
}
