'use client';
import { ScrollShadow as HScrollShadow, ScrollShadowProps } from "@heroui/react";

export function ScrollShadow({ children, ...props }: ScrollShadowProps) {
    return (
        <HScrollShadow
            {...props}

        >
            {children}
        </HScrollShadow>
    );
}