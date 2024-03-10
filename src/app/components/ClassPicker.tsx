'use client'
import React, {useEffect} from "react";
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@nextui-org/react";

function getClassIcon(classname: string) {
    return `/classicon/classicon_${classname.toLowerCase()}.jpg`;
}

export default function ClassPicker({onChange}: { onChange: (value: string) => void }) {
    const [selectedKeys, setSelectedKeys] = React.useState(new Set(["Class"]));


    const selectedValue = React.useMemo(
        () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
        [selectedKeys]
    );

    useEffect(() => {
        onChange(selectedValue);
    }, [selectedValue]);

    return (
        <Dropdown className="bg-moss">
            <DropdownTrigger>
                <Button
                    className="capitalize bg-moss w-full justify-evenly text-gold font-bold"
                >
                    {selectedValue} {selectedValue !== "Class" &&
                  <img src={getClassIcon(selectedValue)} alt={selectedValue} className="w-6 h-6 rounded-full"/>}
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
                <DropdownItem key="warrior">Warrior</DropdownItem>
                <DropdownItem key="paladin">Paladin</DropdownItem>
                <DropdownItem key="hunter">Hunter</DropdownItem>
                <DropdownItem key="rogue">Rogue</DropdownItem>
                <DropdownItem key="priest">Priest</DropdownItem>
                <DropdownItem key="shaman">Shaman</DropdownItem>
                <DropdownItem key="mage">Mage</DropdownItem>
                <DropdownItem key="warlock">Warlock</DropdownItem>
                <DropdownItem key="druid">Druid</DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
}
