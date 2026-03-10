'use client'
import AchievementsProvider from "@/context/AchievementsContext";
import ApplicantsContext from "@/context/ApplicantsContext";
import { ModalProvider } from "@/context/ModalProvider";
import ReactQueryProvider from "@/context/ReactQueryProvider";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useRef, type ReactNode } from "react";
import { ApiHealthBanner } from "../components/api-health-banner";
import { AuthProvider } from "@/context/AuthContext";
import { useCharacterStore } from "../components/characterStore";
import { useRouter } from "next/navigation";


function Providers({ children }: { children: ReactNode, didSsrRefresh?: boolean, ssrRefreshedAt?: number }) {
    const selectedCharacter = useCharacterStore(state => state.selectedCharacter);
    const router = useRouter();
    const isFirstRender = useRef(true);
    
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        
        router.refresh();
    }, [selectedCharacter, router]);

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
