// CardBody Card, CardFooter CardHeader
'use client';
import { Card as HCard, CardBody as HCardBody, CardFooter as HCardFooter, CardHeader as HCardHeader, CardProps } from "@heroui/react";

export function Card({ children, classNames, ...props }: CardProps) {
    return (
        <HCard
            {...props}
            classNames={{
                ...classNames,
            }}
        >
            {children}
        </HCard>
    );
}

export function CardBody({ children, ...props }: React.ComponentProps<typeof HCardBody>) {
    return (
        <HCardBody
            {...props}
        >
            {children}
        </HCardBody>
    );
}

export function CardFooter({ children, ...props }: React.ComponentProps<typeof HCardFooter>) {
    return (
        <HCardFooter
            {...props}
        >
            {children}
        </HCardFooter>
    );
}

export function CardHeader({ children, ...props }: React.ComponentProps<typeof HCardHeader>) {
    return (
        <HCardHeader
            {...props}
        >
            {children}
        </HCardHeader>
    );
}
