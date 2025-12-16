'use client'
import * as React from "react";
import { type ReactNode } from "react";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import ApplicantsContext from "@/app/providers/ApplicantsContext";
import { ModalProvider } from "@/app/providers/ModalProvider";
import AchievementsProvider from "@/app/providers/AchievementsContext";
import ReactQueryProvider from "@/app/providers/ReactQueryProvider";
import { AuthProvider } from "./context/AuthContext";
import { ApiHealthBanner } from "./components/api-health-banner";


function Providers({ children }: { children: ReactNode, didSsrRefresh?: boolean, ssrRefreshedAt?: number }) {

    return (
        <AuthProvider>
            <ReactQueryProvider>
                <ApplicantsContext>
                    <ModalProvider>
                        <AchievementsProvider>
                            <NextThemesProvider attribute="class" defaultTheme="light">
                                <HeroUIProvider style={{ height: "100%" }}>
                                    <ApiHealthBanner />
                                    {children}
                                </HeroUIProvider>
                            </NextThemesProvider>
                        </AchievementsProvider>
                    </ModalProvider>
                </ApplicantsContext>
            </ReactQueryProvider>
        </AuthProvider>
    );
}

export default Providers;
