'use client';

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface NextAuthSessionProviderProps{
    children: ReactNode
    session:any
}


export default function NextAuthSessionProviderProps({children,session}: NextAuthSessionProviderProps){
return( <SessionProvider session={session}>{children}</SessionProvider>

)
}