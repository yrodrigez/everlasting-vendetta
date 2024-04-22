import Link from "next/link";

export const HeaderMenuButton = ({text, url}: { text: string, url?: string }) => {
    const key = text.toLowerCase();
    const allowed = ['apply', 'roster', 'calendar',];
    return (
        <Link
            className="px-2 py-1 flex flex-col items-center rounded hover:cursor-pointer hover:bg-white hover:bg-opacity-20 backdrop-filter backdrop-blur-md min-w-16 max-w-16"
            href={url || `/${allowed.indexOf(key) === -1 ? '' : key}`}>
            <img alt={text} src={`/btn-${key}.png`} className="rounded-full w-9 h-9 min-h-9 max-h-9 min-w-9 max-w-9"/>
            <span>{text}</span>
        </Link>
    )
}
