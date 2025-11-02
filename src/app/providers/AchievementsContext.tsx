'use client'
import {createContext, type ReactNode} from "react";
import useAchievements from "@hooks/useAchievements";

const AchievementsContext = createContext(null);

export default function ({children}: { children: ReactNode }) {
	useAchievements()
	return <AchievementsContext.Provider value={null}>{children}</AchievementsContext.Provider>
}
