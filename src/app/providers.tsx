'use client'
import * as React from "react";

// 1. import `NextUIProvider` component
import {NextUIProvider} from "@nextui-org/react";
import {ReactNode} from "react";

function Providers({children}: { children: ReactNode }) {
    // 2. Wrap NextUIProvider at the root of your app
    return (
        <NextUIProvider>
            {children}
        </NextUIProvider>
    );
}
export default Providers;
