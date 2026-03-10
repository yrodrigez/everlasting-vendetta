'use client';
import { Slider as HSlider, type SliderProps } from "@heroui/react";

export function Slider({ classNames, ...props }: SliderProps) {
    return (
        <HSlider
            {...props}
            classNames={{
                track: 'bg-wood-900 border border-wood-100',
                filler: 'bg-moss',
                thumb: 'bg-wood-900 border border-wood-100 data-[dragging=true]:border-moss-100',
                label: 'text-default/60',
                value: 'text-default',
                ...classNames,
            }}
        />
    );
}
