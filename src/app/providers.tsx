'use client'
import * as React from "react";
import {type ReactNode} from "react";
import {NextUIProvider} from "@nextui-org/react";
import {QueryClient, QueryClientProvider,} from '@tanstack/react-query'
import {ThemeProvider as NextThemesProvider} from "next-themes";
import ApplicantsContext from "@/app/providers/ApplicantsContext";
import {ModalProvider} from "@/app/providers/ModalProvider";
import AchievementsProvider from "@/app/providers/AchievementsContext";
import {createBrowserClient} from "@supabase/ssr";


function Providers({children}: { children: ReactNode }) {
	const queryClient = new QueryClient()

	/*window?.supabase = createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
	)*/
	return (
		<NextUIProvider style={{height: "100%"}}>
			<QueryClientProvider client={queryClient}>
				<NextThemesProvider attribute="class" defaultTheme="light">
					<ApplicantsContext>
						<ModalProvider>
							<AchievementsProvider>
								{children}
							</AchievementsProvider>
						</ModalProvider>
					</ApplicantsContext>
				</NextThemesProvider>
			</QueryClientProvider>
		</NextUIProvider>
	);
}

export default Providers;
