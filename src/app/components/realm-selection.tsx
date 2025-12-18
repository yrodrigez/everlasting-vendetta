'use client'
import { Select } from "@/app/components/select";
import { useAllowedRealms } from "@/app/hooks/api/use-allowed-realms";
import { SelectItem } from "@heroui/react";

export function RealmSelection({ onRealmChange, realm }: { onRealmChange?: (realm: string) => void, realm?: string, }) {
    const { allowedRealms: realms, isLoading } = useAllowedRealms()

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
                onRealmChange && onRealmChange(target.value)
            }}
        >
            {(realm: { slug: string, name: string }) => <SelectItem key={realm.slug} id={realm.slug}>{realm.name}</SelectItem>}
        </Select>
    )
}