import { AnimatedModal } from "@/app/components/AnimatedModal";
import { Button } from "@/app/components/Button";
import { Battlenet, Discord } from "@/app/components/svg-icons";
import { useAuth } from "@/app/context/AuthContext";
import { useApiHealth } from "@/app/hooks/api/use-api-health";
import useScreenSize from "@/app/hooks/useScreenSize";
import { createHandleAuthMessage, openAuthWindow } from "@/app/util/blizzard/loginOnWindow";
import { BNET_LOGIN_URI, DISCORD_LOGIN_URL } from "@utils/constants";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function LinkedAccountModal() {
    const path = usePathname()
    const { isDesktop } = useScreenSize()

    const battleNetLoginUrl = useMemo(() => {
        const sp = new URLSearchParams();
        if (path) {
            sp.append('redirectedFrom', path);
        }

        if (isDesktop) {
            sp.append('windowOpener', 'true');
        }

        sp.append('linkAccount', 'true');
        return `${BNET_LOGIN_URI}?${sp.toString()}`
    }, [BNET_LOGIN_URI, path, isDesktop]);

    const discordLoginUrl = useMemo(() => {
        const sp = new URLSearchParams();
        if (path) {
            sp.append('redirectedFrom', path);
        }

        if (isDesktop) {
            sp.append('windowOpener', 'true');
        }

        sp.append('linkAccount', 'true');
        return `${DISCORD_LOGIN_URL}?${sp.toString()}`
    }, [DISCORD_LOGIN_URL, path, isDesktop]);

    const { isHealthy } = useApiHealth();
    const { isAuthenticated } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const onClose = () => setIsOpen(false);
    const onOpen = () => setIsOpen(true);

    useEffect(() => {
        if (!isAuthenticated || !isOpen) {
            onClose();
            return;
        }
    }, [isAuthenticated, isOpen, onClose, onOpen, isHealthy]);

    const handleLogin = useCallback((url: string, windowTitle: string) => {
        if (!isHealthy) return onClose();
        if (isDesktop) {
            const authWin = openAuthWindow(url, windowTitle, 600, 880);
            const handleAuthMessage = (event: MessageEvent) => createHandleAuthMessage(event, () => {
                authWin?.close();
                window.removeEventListener('message', handleAuthMessage);
                window.location.reload();
            })
            window.addEventListener('message', handleAuthMessage);
        } else {
            window.location.href = url;
        }
        onClose();
    }, [isDesktop, openAuthWindow, createHandleAuthMessage, onClose]);

    const triggerRef = useRef<HTMLElement | null>(null);

    return (
        <>
            <Button
                ref={ref => {
                    if (triggerRef) {
                        (triggerRef as React.MutableRefObject<HTMLElement | null>).current = ref;
                    }
                }}
                onPress={() => onOpen()}
            >+ Link another</Button>
            <AnimatedModal
                isOpen={isOpen}
                onClose={onClose}
                triggerRef={triggerRef}
                title="Link an account"
            >
                <div className="flex flex-col gap-3">
                    <Button
                        onPress={() => handleLogin(battleNetLoginUrl, 'Battle.net Login')}
                        className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-battlenet transition-colors border border-battlenet/30 bg-battlenet text-white"
                        startContent={
                            <Battlenet className="w-8 h-8 text-white" />
                        }
                    >
                        <span>Link a Battle.net account</span>
                    </Button>
                    <Button
                        onPress={() => handleLogin(discordLoginUrl, 'Discord Login')}
                        className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-discord transition-colors border border-discord/30 bg-discord text-white"
                    >
                        <Discord className="w-8 h-8 text-white" />
                        <span>Link a Discord account</span>
                    </Button>
                </div>
            </AnimatedModal>
        </>
    )
}