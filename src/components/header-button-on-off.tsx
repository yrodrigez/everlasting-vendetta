'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";

const className = "px-2 py-1 flex flex-col items-center rounded hover:cursor-pointer hover:bg-white hover:bg-opacity-20 backdrop-filter backdrop-blur-md min-w-16 max-w-16 transition-all duration-300 ease-in-out";

const variants = {
    shadow: " hover:shadow-lg hover:shadow-gold",
}

export function HeaderMenuButtonOnOff({ text, path, hoverImg, defaultImg, onClick, variant }: { text: string, path: string, hoverImg: string, defaultImg: string, onClick?: () => void, variant?: keyof typeof variants }) {
    const currentPath = usePathname();
    const blur = defaultImg;
    const hover = hoverImg;
    const buttonClass = className ;
    const hoverClass = variant ? variants[variant] : "";

    return (
        <Link
            className={buttonClass + " group"}
            href={path}
        >
            <div className="relative w-9 h-9 rounded-full">
                <img
                    width="36"
                    height="36"
                    alt={text} src={blur}
                    className={`transition-all duration-300 ease-in-out rounded-full w-9 h-9 min-h-9 max-h-9 min-w-9 max-w-9 ${currentPath.startsWith(path) ? "opacity-0" : "opacity-100"}`}
                />
                <img
                    width="36"
                    height="36"
                    alt={text} src={hover}
                    className={`${hoverClass} opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out absolute top-0 left-0 rounded-full w-9 h-9 min-h-9 max-h-9 min-w-9 max-w-9 ${currentPath.startsWith(path) ? "opacity-100" : ""}`}
                />
            </div>
            <span
                className="text-sm"
            >{text}</span>
        </Link>
    );
}