'use client';
import { Input as HerouiInput, InputProps } from "@heroui/react";

export function Input({ children, classNames, ...props }: InputProps) {
    return (
        <HerouiInput
            {...props}
            classNames={{
                inputWrapper: 'text-default transition-all duration-200 bg-wood-900 border border-wood-100 text-default hover:border-wood-100 focus:border-wood-100 focus:ring-2 focus:ring-wood-100 data-[hover=true]:border-wood-100 data-[hover=true]:bg-wood hover:bg-wood group[data-focus="true"]:bg-wood group-data-[focus=true]:bg-wood',
                label: 'text-default/60 group-data-[filled="true"]:text-default/60',
                description: 'text-default',
                input: 'text-default group[data-has-value="true"]:text-default group-data-[has-value="true"]:text-default',
                ...classNames,
            }}
        >
            {children}
        </HerouiInput>
    );
}