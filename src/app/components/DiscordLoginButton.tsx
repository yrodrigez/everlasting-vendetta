'use client'
import { Button, type ButtonProps } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import useScreenSize from "@/app/hooks/useScreenSize";
import { createHandleAuthMessage, openAuthWindow } from "@/app/util/blizzard/loginOnWindow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

const LoginButton = ({ onClick, href, as }: { onClick?: () => any, as?: string, href?: string } & ButtonProps) => {
    return (
        <Button
            size="lg"
            {...(as ? { as } : {})}
            href={href}
            onPress={() => onClick && onClick()}
            startContent={(
                <FontAwesomeIcon icon={faDiscord} size="lg" />
            )}
            className="bg-discord border border-discord-10 text-white rounded-md text-xl w-full"
        >
            Discord
        </Button>
    );
};

export function DiscordLoginButton() {
    const path = usePathname();
    const loginPath = '/api/v1/oauth/discord/auth';
    const { isDesktop } = useScreenSize();
    const loginUrl = `${loginPath}${path ? `?redirectedFrom=${encodeURIComponent(path)}${isDesktop ? '&windowOpener=true' : ''}` : ''}`;
    const router = useRouter();

    return isDesktop ? (
        <div
        className="w-full">
            <LoginButton
                onClick={() => {
                    const authWin = openAuthWindow(loginUrl, 'Discord Login', 600, 800);
                    const handleAuthMessage = (event: MessageEvent) => createHandleAuthMessage(event, () => {
                        window.removeEventListener('message', handleAuthMessage);
                        authWin?.close();
                        router.refresh();
                    });

                    window.addEventListener('message', handleAuthMessage);
                }}
            />
        </div>
    ) : (
        <LoginButton as="a" href={loginUrl} />
    );
}
