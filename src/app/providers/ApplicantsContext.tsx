'use client'
import useApplicants from "@hooks/useApplicants";
import {createContext, type ReactNode} from "react";

const ApplicantsContext = createContext(null);

export default function ({children}: { children: ReactNode }) {
    useApplicants();

    return <ApplicantsContext.Provider value={null}>
        {children}
    </ApplicantsContext.Provider>;

}
