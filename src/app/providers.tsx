'use client'
import * as React from "react";

import {NextUIProvider} from "@nextui-org/react";
import {ReactNode} from "react";
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'

function Providers({children}: { children: ReactNode }) {
    const queryClient = new QueryClient()
    return (
        <NextUIProvider>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </NextUIProvider>

    );
}

export default Providers;
