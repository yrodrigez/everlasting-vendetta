import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import ResizeManager from "@/app/components/ResizeManager";
import Providers from "@/app/providers";
import {BattleNetAuthManagerWindow} from "@/app/components/BattleNetAuthManagerWindow";
import {cookies} from "next/headers";
import ProfileManager from "@/app/components/ProfileManager";
import {config} from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import {Toaster} from "sonner";
import React from "react";
import {HeaderMenuButton} from "@/app/components/HeaderMenuButton";
import {LoginButton} from "@/app/components/LoginButton";

config.autoAddCss = false;
const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "Everlasting Vendetta - Raids on Lone Wolf",
    description: "Everlasting Vendetta is an active guild seeking raiders to join on the Lone Wolf server. Join us to conquer the greatest WoW challenges!",
    keywords: "wow, world of warcraft, guild recruitment, raiding, pve, pvp, classic, tbc, burning crusade, shadowlands, lone wolf, everlasting vendetta, guild events, guild forum, season of discovery, sod",
};


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    const battleNetRedirectUrl = `${process.env.BNET_LOGIN_URI}`;
    const battleNetToken = cookies().get('bnetToken');

    return (
        <html lang="en" className="light">
        <body className={inter.className} style={{width: '100%', height: '100%', position: 'relative'}}>
        <Providers>
            <div className="pt-1 flex flex-col w-full h-full max-h-full min-h-screen items-center">
                <div className="h-[80px] w-full flex items-center justify-center border-b border-gold relative">
                    <div className="md:max-w-[900px] flex items-center justify-between h-full ">
                        <div className="flex items-center md:w-[240px] flex-1 gap-2 justify-center mr-2 lg:mr-0">
                            <HeaderMenuButton text="Home"/>
                            {/*<HeaderMenuButton text="News"/>*/}
                            <HeaderMenuButton text="Apply"/>
                            <HeaderMenuButton text="Stats"/>
                        </div>
                        <img alt={'center-img'} src={`/center-img.png`}
                             className="flex-1 rounded-full max-w-20 hidden md:flex"/>
                        <div className="flex items-center md:w-[240px] flex-1 gap-2 justify-center">
                            <HeaderMenuButton text="Roster"/>
                            {/*<HeaderMenuButton text="Forum"/>*/}
                            <HeaderMenuButton text="Calendar"/>
                        </div>
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
            <div className="absolute right-2 bottom-6 md:top-2.5 md:bottom-full">
                {!battleNetToken ? <LoginButton battleNetRedirectUrl={battleNetRedirectUrl}/> : <ProfileManager/>}
            </div>
            <Toaster richColors position="top-center"/>
        </Providers>
        </body>
        </html>
    );
}
