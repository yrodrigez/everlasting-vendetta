'use client';
import { Tooltip as HerouiTooltip, TooltipProps } from "@heroui/react";

export function Tooltip({ children, classNames, ...props }: TooltipProps) {
    return (
        <HerouiTooltip
            {...props}
            classNames={{
                ...classNames,
            }}
        >
            {children}
        </HerouiTooltip>
    );
}