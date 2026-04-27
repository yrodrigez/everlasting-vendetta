'use client';
import { Tooltip as HerouiTooltip, TooltipProps } from "@heroui/react";

export function Tooltip({ children, classNames, ...props }: TooltipProps) {
    return (
        <HerouiTooltip
            className="border border-wood-100 max-w-sm shadow-md shadow-wood-900"
            {...props}
            classNames={{
                ...classNames,
            }}
        >
            {children}
        </HerouiTooltip>
    );
}
