'use client'
import React, {useEffect} from "react";
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@heroui/react";


export default function LookupField({value, onChange, values, icon, title}: {
    value: string,
    onChange?: (value: string) => void,
    values: Set<string>,
    icon: string,
    title?: string
}) {
    const [selectedKeys, setSelectedKeys] = React.useState(new Set([value || title || ""]));

    const [selectedValue, setSelectedValue] = React.useState(value || title || "");

    useEffect(() => {
        setSelectedValue(Array.from(selectedKeys)[0]);
    }, [selectedKeys]);

    useEffect(() => {
        if (selectedValue !== title && onChange) {
            onChange(selectedValue);
        }
    }, [selectedKeys, selectedValue]);

    return (
        <Dropdown className="bg-moss">
            <DropdownTrigger>
                <Button
                    className="capitalize bg-moss w-full justify-evenly text-gold font-bold"
                >
                    {value || title} {value &&
                  <img src={icon} alt={value} className="w-6 h-6 rounded-full"/>}
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Hero Class"
                variant="flat"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={selectedKeys}
                className={"bg-moss"}
                onSelectionChange={setSelectedKeys as any}
            >
                {Array.from(values).map((value: string) => {
                    return (
                        <DropdownItem key={value}>
                            {value}
                        </DropdownItem>
                    );
                })}
            </DropdownMenu>
        </Dropdown>
    );
}
