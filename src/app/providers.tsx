'use client'
import * as React from "react";

import {NextUIProvider} from "@nextui-org/react";
import {ReactNode} from "react";
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import {ThemeProvider as NextThemesProvider} from "next-themes";

function Providers({children}: { children: ReactNode }) {
    const queryClient = new QueryClient()
    return (
        <NextUIProvider>
            <QueryClientProvider client={queryClient}>
                <NextThemesProvider attribute="class" defaultTheme="light">
                    {children}
                </NextThemesProvider>
            </QueryClientProvider>
        </NextUIProvider>

    );
}

export default Providers;
