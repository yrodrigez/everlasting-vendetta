'use client';
import { TimeInput as HerouiTimeInput, TimeInputProps } from "@heroui/react";

export function TimeInput({ children, classNames, ...props }: TimeInputProps) {
    return (
        <HerouiTimeInput
            {...props}
            classNames={{
                inputWrapper: 'text-default transition-all duration-200 bg-wood-900 border border-wood-100 text-default hover:border-wood-100 focus:border-wood-100 focus:ring-2 focus:ring-wood-100 data-[hover=true]:border-wood-100 data-[hover=true]:bg-wood hover:bg-wood',
                 segment: 'text-default/60 data-[editable=true]:text-default',
                label: 'text-default/60 group-data-[filled="true"]:text-default/60',
                description: 'text-default',
                ...classNames,
            }}
        >
            {children}
        </HerouiTimeInput>
    );
}