'use client'
import { Button } from "@/components/Button";
import { sendActionEvent } from '@/hooks/usePageEvent';
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function DiscordLink({ raidId }: { raidId: string }) {
    return (
        <Button
            tooltip={{
                content: "Join our Discord",
                placement: "right"
            }}
            onPress={() => {
                sendActionEvent('discord_link_click', { raidId });
                window.open('https://discord.gg/fYw9WCNFDU', '_blank');
            }}
            className={`bg-moss text-default font-bold rounded`} isIconOnly>
            <FontAwesomeIcon icon={faDiscord} />
        </Button>
    )
}
