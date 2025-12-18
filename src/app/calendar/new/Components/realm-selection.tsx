'use client'
import useCreateRaidStore from "./useCreateRaidStore";

import { RealmSelection as CustomRealmSelection } from "@/app/components/realm-selection";

export function RealmSelection() {
    const setRealm = useCreateRaidStore(state => state.setRealm)
    const realm = useCreateRaidStore(state => state.realm)
    return (
        <CustomRealmSelection
            realm={realm}
            onRealmChange={(newRealm) => {
                setRealm(newRealm)
            }}
        />
    )
}