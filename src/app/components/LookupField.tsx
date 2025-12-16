'use client'
import React, { useEffect } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";


export default function LookupField({ value, onChange, values, icon, title }: {
    value: string | { label: string, slug: string, icon?: string },
    onChange?: (value: string) => void,
    values: Set<string> | Set<{ label: string, slug: string, icon?: string }>,
    icon?: string,
    title?: string
}) {
    const slug = React.useMemo(() => typeof value === "string" ? value : value?.slug, [value]);
    const label = React.useMemo(() => {
        if (!slug) return title;

        for (const val of values) {
            const valSlug = typeof val === "string" ? val : val.slug;
            if (valSlug === slug) {
                return typeof val === "string" ? val : val.label;
            }
        }

        return title;
    }, [value, title, slug]);

    return (
        <Dropdown className="bg-moss">
            <DropdownTrigger>
                <Button
                    className="capitalize bg-moss w-full justify-evenly text-gold font-bold"
                >
                    {label} {value && icon &&
                        <img src={icon} alt={slug} className="w-6 h-6 rounded-full" />}
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Hero Class"
                variant="flat"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={new Set([slug])}
                className={"bg-moss"}
                onSelectionChange={(x) => {
                    const _value = Array.from(x)[0];
                    for (const val of values) {
                        const valSlug = typeof val === "string" ? val : val.slug;
                        if (valSlug === _value) {
                            if (onChange) {
                                onChange(valSlug);
                            }
                            return;
                        }
                    }
                }}
            >
                {[...values].map((value: string | { label: string, slug: string, icon?: string }) => {
                    return (
                        <DropdownItem key={typeof value === "string" ? value : value.slug} className="capitalize flex justify-between items-center">
                            {typeof value === "string" ? value : value.label}
                            {typeof value === "object" && value.icon && (
                                <img src={value.icon} alt={value.label} className="w-6 h-6 rounded-full" />
                            )}
                        </DropdownItem>
                    );
                })}
            </DropdownMenu>
        </Dropdown>
    );
}
