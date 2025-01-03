'use server'
import Link from "next/link";
import Image from "next/image";
import createServerSession from "@utils/supabase/createServerSession";
import {cookies} from "next/headers";
import {GUILD_ID} from "@utils/constants";
import {Badge} from "@nextui-org/badge";

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
export const HeaderMenuButton = async ({text, url, onClick}: {
    text: string,
    url?: string,
    onClick?: (() => void) | undefined
}) => {
    const key = text.toLowerCase();
    const allowed = ['apply', 'roster', 'calendar', 'stats'];
    const className = "px-2 py-1 flex flex-col items-center rounded hover:cursor-pointer hover:bg-white hover:bg-opacity-20 backdrop-filter backdrop-blur-md min-w-16 max-w-16";
    const {auth, supabase} = createServerSession({cookies})
    const session = await auth.getSession()
    const canReadApplications = session?.permissions.indexOf('applications.read') !== -1
    let applyCount = 0
    if (key === 'apply' && session && session?.guild?.id === GUILD_ID && canReadApplications) {
        url = '/apply/list'
        text = 'Applies'
        const {
            data
        } = await supabase.from('ev_application').select('created_at, id')
            .is('reviewed_by', null)

        applyCount = data?.length ?? 0
    }

    return (onClick ? (
            <div
                className={className}
                onClick={onClick}>
                <Children text={text} imgKey={key}/>
            </div>
        ) : (
            <Badge
                content={applyCount}
                classNames={{
                    badge:'mt-1',
                }}
                showOutline={false}
                className="shadow-sm text-gold bg-dark border-gold border-1 shadow-gold"
                isInvisible={!applyCount}
            >
                <Link
                    className={className}
                    href={url || `/${allowed.indexOf(key) === -1 ? '' : key}`}>
                    <Children text={text} imgKey={key}/>
                </Link>
            </Badge>
        )
    )
}
