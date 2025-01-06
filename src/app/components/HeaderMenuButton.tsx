import Link from "next/link";
import Image from "next/image";
import ApplicantsHeaderButton from "@/app/components/ApplicantsHeaderButton";

const Children = ({text, imgKey}: { text: string, imgKey: string }) => (
    <>
        <Image
            width="36"
            height="36"
            alt={text} src={`/btn-${imgKey}.png`}
            className="rounded-full w-9 h-9 min-h-9 max-h-9 min-w-9 max-w-9"/>
        <span>{text}</span>
    </>
)
export const HeaderMenuButton = ({text, url, onClick}: {
    text: string,
    url?: string,
    onClick?: (() => void) | undefined
}) => {
    const key = text.toLowerCase();
    const allowed = ['apply', 'roster', 'calendar', 'stats'];
    const className = "px-2 py-1 flex flex-col items-center rounded hover:cursor-pointer hover:bg-white hover:bg-opacity-20 backdrop-filter backdrop-blur-md min-w-16 max-w-16";


    return text === 'Apply' ? (
        <ApplicantsHeaderButton
            text={text}
            url={url}
            onClick={onClick}
        />
    ) : onClick ? (
        <div
            className={className}
            onClick={onClick}>
            <Children text={text} imgKey={key}/>
        </div>
    ) : (
        <Link
            className={className}
            href={url || `/${allowed.indexOf(key) === -1 ? '' : key}`}>
            <Children text={text} imgKey={key}/>
        </Link>
    )

}
