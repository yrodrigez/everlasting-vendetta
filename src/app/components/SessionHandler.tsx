'use client'

import { useAuth } from "../context/AuthContext";
import { BNET_LOGIN_URI } from "../util/constants";
import { LoginButton } from "./LoginButton";
import ProfileManager from "./ProfileManager";

export function SessionHandler({ session }: { session?: any }) {
    const { isAuthenticated } = useAuth();
    return (
        (session || isAuthenticated) ? <ProfileManager /> : <LoginButton battleNetRedirectUrl={BNET_LOGIN_URI} />
    );
}