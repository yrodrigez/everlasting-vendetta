import { createRosterMemberRoute } from "@/util/create-roster-member-route";
import Link from "next/dist/client/link";

function capitalize(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

export const CharacterChip = ({ name, realmSlug, avatar, className, size }: {
    name: string,
    realmSlug: string,
    avatar?: string,
    className?: string,
    size?: 'xs' | 'sm' | 'md' | 'lg',
}) => {
    const classLower = className?.toLowerCase();
    const borderClass = classLower ? `border-${classLower}` : 'border-dark-100';
    const textClass = classLower ? `text-${classLower}` : 'text-white';

    const sizeClass = size ? `text-${size}` : 'text-sm';
    const sizeImageClass = size === 'xs' ? 'w-4 h-4' : size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-6 h-6' : 'w-7 h-7';

    return (
        <Link
            href={createRosterMemberRoute(name, realmSlug)}
            target="_blank"
            className={`inline-flex items-center gap-1.5 align-middle pl-0.5 pr-2.5 py-0.5 rounded-full border bg-dark ${borderClass} hover:bg-dark`}
        >
            {avatar && (
                <img src={avatar} alt={`${name}'s avatar`} className={`${sizeImageClass} rounded-full border ${borderClass}`} />
            )}
            <span className={`font-semibold ${sizeClass} ${textClass}`}>{capitalize(name)}</span>
        </Link>
    );
};