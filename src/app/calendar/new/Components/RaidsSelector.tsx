'use client'

import {Select, SelectItem} from "@heroui/react";
import useCreateRaidStore from "@/app/calendar/new/Components/useCreateRaidStore";

export default function RaidsSelector({raids}: {
    raids: { id: string, name: string, min_level: number, image: string, reservation_amount: number }[]
}) {
    const setRaid = useCreateRaidStore(state => state.setRaid)
    const raid = useCreateRaidStore(state => state.raid)

    return (
        <Select
            variant="flat"
            items={raids ?? []}
            label="Select a raid"
            placeholder="Select a raid"
            className="max-w-[400px]"
            radius="md"
            selectionMode="single"
            selectedKeys={[raid?.id] as Iterable<string>}
            onChange={({target}) => {
                const raid = raids.find(raid => raid.id === target.value)
                setRaid(raid)
            }}
        >
            {(raid) => <SelectItem key={raid.id} id={raid.name}>{raid.name}</SelectItem>}
        </Select>
    )
}
