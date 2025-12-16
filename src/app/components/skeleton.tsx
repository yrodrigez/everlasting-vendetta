'use client';
import { Skeleton as HSkeleton } from "@heroui/react";

export function Skeleton(props: React.ComponentProps<typeof HSkeleton>) {
    return <HSkeleton {...props} />;
}