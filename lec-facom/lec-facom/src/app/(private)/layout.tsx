
import { getServerSession } from "next-auth";
import { ReactNode } from "react";
import { nextAuth } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeaderPrivate } from "@/components/headerPrivate"

import NextAuthSessionProvider from "@/components/providers/sessionProviders";
import { Inter } from "next/font/google";

interface PrivateLayoutProps {
    children: ReactNode
}

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
})



export default async function PrivateLayout({ children }: PrivateLayoutProps) {
    const session = await getServerSession(nextAuth)
    if (!session) {
        redirect('/')
    }



    return (
        <NextAuthSessionProvider session={session} >
            <HeaderPrivate />
            <main className="flex-1 flex flex-col mt-16" >

                {children}
            </main>
            <Footer />
        </NextAuthSessionProvider>

    )
}