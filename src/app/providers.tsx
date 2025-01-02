'use client'
import * as React from "react";
import {type ReactNode} from "react";
import {NextUIProvider} from "@nextui-org/react";
import {QueryClient, QueryClientProvider,} from '@tanstack/react-query'
import {ThemeProvider as NextThemesProvider} from "next-themes";
import ApplicantsContext from "@/app/providers/ApplicantsContext";


function Providers({children}: { children: ReactNode }) {
    const queryClient = new QueryClient()

    return (
        <NextUIProvider style={{height: "100%"}}>
            <QueryClientProvider client={queryClient}>
                <NextThemesProvider attribute="class" defaultTheme="light">
                    <ApplicantsContext>
                        {children}
                    </ApplicantsContext>
                </NextThemesProvider>
            </QueryClientProvider>
        </NextUIProvider>
    );
}

export default Providers;
