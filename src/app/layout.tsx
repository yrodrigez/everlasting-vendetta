import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import Link from "next/link";
import ResizeManager from "@/app/components/ResizeManager";
import Providers from "@/app/providers";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "Everlasting Vendetta Guild",
    description: "Everlasting Vendetta Guild Website",
};
const HeaderMenuButton = ({text}: { text: string }) => {
    let key = text.toLowerCase();

    return (
        <Link
            className="px-2 py-1 flex flex-col items-center rounded hover:cursor-pointer hover:bg-white hover:bg-opacity-20 backdrop-filter backdrop-blur-md"
            href={`/${key !== 'roster' ? '' : key}`}>
            <img alt={text} src={`/btn-${key}.png`} className="rounded-full w-9 h-9"/>
            <span>{text}</span>
        </Link>
    )
}



export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <html lang="en">
        <body className={inter.className} style={{width: '100%', height: '100%'}}>
        <Providers>
            <div className="pt-1 flex flex-col w-full h-full max-h-full min-h-screen items-center">
                <div className="h-20 md:max-w-[900px] flex items-center justify-between">
                    <div className="flex items-center md:w-[240px] flex-1 gap-3 justify-center">
                        <HeaderMenuButton text="Home"/>
                        {/*<HeaderMenuButton text="News"/>
                        <HeaderMenuButton text="Apply"/>*/}
                    </div>
                    <img alt={'center-img'} src={`/center-img.png`} className="flex-1 rounded-full max-w-20"/>
                    <div className="flex items-center md:w-[240px] flex-1 gap-3 justify-center">
                        <HeaderMenuButton text="Roster"/>
                        {/*<HeaderMenuButton text="Forum"/>
                        <HeaderMenuButton text="Calendar"/>*/}
                    </div>
                </div>
                <div className="flex justify-center bg-[url('/banner.png')] min-h-screen md:min-h-[700px] h-full w-full bg-no-repeat bg-center md:bg-contain bg-cover" style={{backgroundColor: 'rgb(19,19,19)'}}>
                    <div
                        className={`p-3 md:w-[1200px] w-full h-[850px] md:h-[800px] overflow-auto scrollbar-pill bg-[rgba(19,19,19,.78)] backdrop-filter backdrop-blur-sm rounded-xl`}>
                        {children}
                    </div>
                </div>
            </div>
            <ResizeManager/>
        </Providers>
        </body>
        </html>
    );
}
