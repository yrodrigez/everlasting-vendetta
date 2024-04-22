'use client'
import {HeaderMenuButton} from "@/app/components/HeaderMenuButton";
import {usePathname} from "next/navigation";

export const LoginButton = ({battleNetRedirectUrl}: { battleNetRedirectUrl: string }) => {
    const path = usePathname()

    return (
        <HeaderMenuButton text="Login"
                          url={`${battleNetRedirectUrl}${path ? `?redirectedFrom=${encodeURIComponent(path)}` : ''}`}/>
    )
}
