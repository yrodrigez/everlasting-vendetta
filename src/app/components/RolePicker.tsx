'use client'
import React from "react";
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@nextui-org/react";

function getRoleIcon(role: string) {

    return {
        'tank': 'https://wow.zamimg.com/images/wow/icons/large/inv_shield_06.jpg',
        'off-tank': 'https://wow.zamimg.com/images/wow/icons/large/inv_shield_06.jpg',
        'healer': 'https://wow.zamimg.com/images/wow/icons/large/spell_holy_heal.jpg',
        'dps': 'https://wow.zamimg.com/images/wow/icons/large/ability_rogue_eviscerate.jpg',
    }[role]

}

export default function RolePicker({setForm}: { setForm: any }) {
    const [selectedKeys, setSelectedKeys] = React.useState(new Set(["Role"]));

    const selectedValue = React.useMemo(
        () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
        [selectedKeys]
    );

    React.useEffect(() => {
        if (selectedValue !== "Role") setForm((form: any) => ({...form, role: selectedValue}));
    }, [selectedValue]);

    return (
        <Dropdown className="bg-moss">
            <DropdownTrigger>
                <Button
                    className="capitalize bg-moss w-full justify-evenly text-gold font-bold"
                >
                    {selectedValue} {selectedValue !== "Role" &&
                  <img src={getRoleIcon(selectedValue)} alt={selectedValue} className="w-6 h-6 rounded-full"/>}
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
                <DropdownItem key="tank">Tank</DropdownItem>
                <DropdownItem key="off-tank">Off tank</DropdownItem>
                <DropdownItem key="healer">Healer</DropdownItem>
                <DropdownItem key="dps">DPS</DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
}
