import Providers from "@/app/providers";
import { HeaderMenuButton } from "@/components/HeaderMenuButton";
import ResizeManager from "@/components/ResizeManager";
import createServerSession from "@/util/supabase/createServerSession";
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from 'next/script';
import React from "react";
import { Toaster } from "sonner";
import { SessionHandler } from "../components/SessionHandler";
import "./globals.css";
import { GUILD_REALM_NAME } from "@/util/constants";
import GoogleTagManager from "@/components/google/google-tag-manager";

config.autoAddCss = false;
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL('https://www.everlastingvendetta.com'),
    title: `Everlasting Vendetta - Raids on ${GUILD_REALM_NAME}`,
    description: `Everlasting Vendetta is an active guild seeking raiders to join on the ${GUILD_REALM_NAME} server. Join us to conquer the greatest WoW challenges!`,
    keywords: "wow, world of warcraft, guild recruitment, raiding, pve, pvp, classic, tbc, burning crusade, shadowlands, lone wolf, everlasting vendetta, guild events, guild forum, season of discovery, sod",
    robots: { index: true, follow: true },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        siteName: 'Everlasting Vendetta',
        title: `Everlasting Vendetta - Raids on ${GUILD_REALM_NAME}`,
        description: `Everlasting Vendetta is an active guild seeking raiders to join on the ${GUILD_REALM_NAME} server. Join us to conquer the greatest WoW challenges!`,
        url: 'https://www.everlastingvendetta.com',
    },
    twitter: {
        card: 'summary_large_image',
        title: `Everlasting Vendetta - Raids on ${GUILD_REALM_NAME}`,
        description: `Everlasting Vendetta is an active guild seeking raiders to join on the ${GUILD_REALM_NAME} server.`,
    },
};


export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { auth } = await createServerSession()
    const session = await auth.getSession()
    return (
        <html lang="en" className="light" suppressHydrationWarning>
            <GoogleTagManager />
            <body className={inter.className}
                style={{ width: '100%', height: '100vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }}
                suppressHydrationWarning>
                <Providers>
                    <div className="block w-full h-full">
                        <div className="block w-full h-[80px] top-0 right-0">
                            <div
                                className="py-1 h-full w-full flex items-center justify-center border-b border-gold relative bg-[rgba(12,18,18)]">
                                <div className="md:max-w-[900px] flex items-center justify-between h-full">
                                    <div className="flex items-center md:w-[240px] flex-1 gap-2 justify-center mr-2 lg:mr-0">
                                        <HeaderMenuButton text="Home" />
                                        <HeaderMenuButton text="Apply" />
                                        {/*<HeaderMenuButton text="Stats"/>*/}
                                        <HeaderMenuButton text="Professions" />
                                    </div>
                                    <img alt="center-img" src="/center-img.webp"
                                        className="flex-1 rounded-full max-w-20 hidden md:flex my-auto" />
                                    <div className="flex items-center md:w-[240px] flex-1 gap-2 md:ml-2">
                                        <HeaderMenuButton text="Roster" />
                                        <HeaderMenuButton text="Calendar" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            id="content-container"
                            className="flex w-full custom-h-full-minus-header bg-no-repeat bg-center bg-cover"
                            style={{ backgroundImage: "url('/banner.webp')" }}>
                            <div
                                className="p-3 w-screen h-full overflow-auto scrollbar-pill bg-[rgba(19,19,19,.78)] backdrop-filter backdrop-blur-sm justify-center items-center flex">
                                <div className="flex flex-col md:max-w-[1150px] w-full h-full grow-0">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                    <ResizeManager />
                    <div className="absolute right-2 bottom-12 md:top-2.5 md:bottom-full">
                        <SessionHandler session={session} />
                    </div>
                    <Toaster richColors position="top-center" />
                </Providers>
                <Script
                    id="organization-schema"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            "name": "Everlasting Vendetta",
                            "url": "https://www.everlastingvendetta.com",
                            "description": `Everlasting Vendetta is an active World of Warcraft guild on the ${GUILD_REALM_NAME} server, focused on raiding and community.`,
                            "sameAs": [
                                "https://www.youtube.com/@EverlastingVendetta"
                            ],
                            "areaServed": {
                                "@type": "Place",
                                "name": GUILD_REALM_NAME
                            },
                            "member": {
                                "@type": "OrganizationRole",
                                "roleName": "Guild"
                            }
                        })
                    }}
                />
                <Script src="/scripts/jquery3.js" strategy="beforeInteractive" />
                <Script src="/scripts/modelviewer.js" strategy="beforeInteractive" />
                <Script src="/scripts/color-thief.min.js" strategy="beforeInteractive" />
                <Script src="/scripts/pixel-canvas.js" strategy="beforeInteractive" />
                <Script src="https://wow.zamimg.com/js/tooltips.js" strategy="beforeInteractive" />
            </body>
        </html>
    );
}
