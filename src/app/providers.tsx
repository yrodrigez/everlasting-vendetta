'use client'
import * as React from "react";
import {ReactNode, useEffect} from "react";

import {NextUIProvider} from "@nextui-org/react";
import {QueryClient, QueryClientProvider,} from '@tanstack/react-query'
import {ThemeProvider as NextThemesProvider} from "next-themes";
import {useSession} from "@hooks/useSession";
import {toast} from "sonner";
import Link from "next/link";

function Providers({children}: { children: ReactNode }) {
    const queryClient = new QueryClient()
    const {supabase} = useSession();
    useEffect(() => {
        if (!supabase) return;
        const channel = supabase.channel(`applications`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'ev_application',
            }, async () => {
                toast.custom(()=>(
                    <Link
                        href={'/apply/list'}
                    >
                        New Application!
                    </Link>
                ))
            }).subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, []);
    return (
        <NextUIProvider style={{ height: "100%" }}>
            <QueryClientProvider client={queryClient}>
                <NextThemesProvider attribute="class" defaultTheme="light">
                    {children}
                </NextThemesProvider>
            </QueryClientProvider>
        </NextUIProvider>
    );
}

export default Providers;
