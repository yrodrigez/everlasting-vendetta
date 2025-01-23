'use client'
import * as React from "react";
import {type ReactNode} from "react";
import {NextUIProvider} from "@nextui-org/react";
import {QueryClient, QueryClientProvider,} from '@tanstack/react-query'
import {ThemeProvider as NextThemesProvider} from "next-themes";
import ApplicantsContext from "@/app/providers/ApplicantsContext";
import {ModalProvider} from "@/app/providers/ModalProvider";
import AchievementsProvider from "@/app/providers/AchievementsContext";


function Providers({children}: { children: ReactNode }) {
	const queryClient = new QueryClient()

	return (
		<QueryClientProvider client={queryClient}>
			<ApplicantsContext>
				<ModalProvider>
					<AchievementsProvider>
						<NextThemesProvider attribute="class" defaultTheme="light">
							<NextUIProvider style={{height: "100%"}}>
								{children}
							</NextUIProvider>
						</NextThemesProvider>
					</AchievementsProvider>
				</ModalProvider>
			</ApplicantsContext>
		</QueryClientProvider>
	);
}

export default Providers;
