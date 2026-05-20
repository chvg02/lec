'use client';

import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { IdleLogoutProvider } from "./IdleLogoutProvider";

interface NextAuthSessionProviderProps {
    children: ReactNode;
    session?: Session | null;
}

export default function NextAuthSessionProvider({ children, session }: NextAuthSessionProviderProps) {
    return (
        <SessionProvider session={session}>
            <IdleLogoutProvider>
                {children}
            </IdleLogoutProvider>
        </SessionProvider>
    );
}
