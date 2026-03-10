'use client';
import { Switch as HSwitch, type SwitchProps } from "@heroui/react";

export function Switch({ children, classNames, ...props }: SwitchProps) {
    return (
        <HSwitch
            {...props}
            classNames={{
                wrapper: 'bg-wood-900 border border-wood-100 group-data-[selected=true]:bg-moss group-data-[selected=true]:border-moss-100',
                label: 'text-default',
                ...classNames,
            }}
        >
            {children}
        </HSwitch>
    );
}
