'use client'
import { useAllowedRealms } from "@/app/hooks/api/use-allowed-realms";
import { SelectItem } from "@heroui/react";
import useCreateRaidStore from "./useCreateRaidStore";
import { Select } from "@/app/components/select";
import { useEffect } from "react";

export function RealmSelection() {
    const { allowedRealms: realms, isLoading } = useAllowedRealms()
    const setRealm = useCreateRaidStore(state => state.setRealm)
    const realm = useCreateRaidStore(state => state.realm)
    return (
        <Select
            isLoading={isLoading}
            items={realms ?? []}
            label="Select a realm"
            placeholder="Select a realm"
            className="max-w-[400px]"
            radius="md"
            selectionMode="single"
            selectedKeys={[realm] as Iterable<string>}
            onChange={({ target }) => {
                setRealm(target.value)
            }}
        >
            {(realm: { slug: string, name: string }) => <SelectItem key={realm.slug} id={realm.slug}>{realm.name}</SelectItem>}
        </Select>
    )
}