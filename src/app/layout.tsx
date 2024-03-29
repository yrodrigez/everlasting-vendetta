import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import Link from "next/link";
import ResizeManager from "@/app/components/ResizeManager";
import Providers from "@/app/providers";
import BattleNetAuthManagerWindow from "@/app/components/BattleNetAuthManagerWindow";
import {cookies} from "next/headers";
import ProfileManager from "@/app/components/ProfileManager";


const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "Everlasting Vendetta Guild",
    description: "Everlasting Vendetta Guild Website",
};
const HeaderMenuButton = ({text, url}: { text: string, url?: string }) => {
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


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    const battleNetRedirectUrl = `${process.env.BNET_LOGIN_URI}`;
    const battleNetToken = cookies().get('bnetToken');
    return (
        <html lang="en" className="light">
        <body className={inter.className} style={{width: '100%', height: '100%'}}>
        <Providers>
            <div className="pt-1 flex flex-col w-full h-full max-h-full min-h-screen items-center">
                <div className="h-[80px] w-full flex items-center justify-center border-b border-gold relative">
                    <div className="md:max-w-[900px] flex items-center justify-between h-full ">
                        <div className="flex items-center md:w-[240px] flex-1 gap-3 justify-center">
                            <HeaderMenuButton text="Home"/>
                            {/*<HeaderMenuButton text="News"/>*/}
                            <HeaderMenuButton text="Apply"/>
                        </div>
                        <img alt={'center-img'} src={`/center-img.png`}
                             className="flex-1 rounded-full max-w-20 hidden md:flex"/>
                        <div className="flex items-center md:w-[240px] flex-1 gap-3 justify-center">
                            <HeaderMenuButton text="Roster"/>
                            {/*<HeaderMenuButton text="Forum"/>*/}
                            <HeaderMenuButton text="Calendar"/>
                        </div>
                    </div>
                    <div className="absolute right-2">
                        {!battleNetToken && <HeaderMenuButton text="Login" url={battleNetRedirectUrl}/>}
                        {battleNetToken && <ProfileManager/>}
                    </div>
                </div>
                <div
                    id="content-container"
                    className="flex justify-center bg-[url('/banner.png')] w-full bg-no-repeat bg-center md:bg-contain bg-cover"
                    style={{backgroundColor: 'rgb(19,19,19)', height: '750px'}}>
                    <div
                        className={`p-3 w-full h-full overflow-auto scrollbar-pill bg-[rgba(19,19,19,.78)] backdrop-filter backdrop-blur-sm justify-center items-center flex`}>
                        <div className="flex flex-col md:max-w-[1000px] w-full h-full">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
            {battleNetToken && <BattleNetAuthManagerWindow token={battleNetToken}/>}
            <ResizeManager/>
        </Providers>
        </body>
        </html>
    );
}
