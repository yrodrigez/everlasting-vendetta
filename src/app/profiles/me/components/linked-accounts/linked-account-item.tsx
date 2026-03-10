import { Battlenet, Discord } from "@/components/svg-icons";
import { useCallback, useMemo } from "react";
import { LinkedAccount } from "./types";
import { useAuth } from "@/context/AuthContext";
import { Tooltip } from "@/components/tooltip";

function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;

    // > 7 días: mostrar fecha
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function LinkedAccountItem({ account, onLink }: {
    account: LinkedAccount;
    onLink?: () => void;
}) {
    const platformConfig = {
        battlenet: {
            icon: "battlenet",
            label: "Battle.net",
            colorClass: "text-[#00AEFF]",
        },
        discord: {
            icon: "discord",
            label: "Discord",
            colorClass: "text-[#5865F2]",
        },
        unknown: {
            icon: "❓",
            label: "Unknown",
            colorClass: "text-stone-400",
        }
    };

    const providerKey = (account.provider.indexOf('bnet') !== -1 ? 'battlenet' : account.provider.indexOf('discord') !== -1 ? 'discord' : 'unknown') as keyof typeof platformConfig;
    const config = platformConfig[providerKey];

    const resolvedIcon = useCallback((platform: string) => {
        switch (platform) {
            case "battlenet":
                return <Battlenet />;
            case "discord":
                return <Discord />;
            default:
                return "❓";
        }
    }, [providerKey]);

    const linkedDate = useMemo(() =>
        new Date(account.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }),
        [account.createdAt]);

    const lastSyncText = useMemo(() =>
        getRelativeTime(new Date(account.lastSyncAt ?? account.createdAt)),
        [account.lastSyncAt, account.createdAt]);

    const { user } = useAuth();

    return (
        <div className="flex items-center justify-between py-4 px-4 rounded-lg bg-wood border border-wood-100 transition-colors relative">
            <div className="flex items-center gap-4 ">
                <div className={`${config.colorClass} text-3xl flex-shrink-0`}>
                    {resolvedIcon(providerKey)}
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-2">
                        <span className="text-primary font-semibold text-base">{config.label}</span>
                        <span className="text-stone-100 text-sm">
                            {account.username}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-100">
                        <span>Connected {linkedDate}</span>
                        <span className="text-stone">•</span>
                        <span>Synced {lastSyncText}</span>
                    </div>

                </div>

            </div>
            <Tooltip content={user?.provider === account.provider ? "This is your currently active account" : "This account is not active"}>
                <div className={`absolute right-2 top-1/2 -translate-y-1/2 transition-opacity w-3 h-3 ${user?.provider === account.provider ? 'bg-green-500' : 'bg-gray-500'} rounded-full flex items-center justify-center z-50`}>
                    <div className={`w-3 h-3 rounded-full ${user?.provider === account.provider ? 'bg-green-500 animate-ping' : 'bg-gray-500'}`} />
                </div>
            </Tooltip>
        </div >
    );
}
