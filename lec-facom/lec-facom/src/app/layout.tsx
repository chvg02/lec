
import { Footer } from "../components/footer"
import { Header } from "../components/header"
import { Inter } from "next/font/google";
import '@/styles/globals.css'

import NextAuthSessionProvider from "@/components/providers/sessionProviders";
import { HeaderPrivate } from "@/components/headerPrivate";
import { useSession } from "next-auth/react";
import { createDefaultAdmin } from "@/lib/createDefaultAdmin";

type LayoutProps = {
    children: React.ReactNode;
}

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
})



export default async function Layout({ children }: LayoutProps) {


    return (
        <html lang="en">
            <body className={`${inter.className} relative flex w-full min-h-screen flex-col`}>
                <Header />
                <main className="flex-1 flex flex-col mt-16">
                    {children}
                 
                </main>
                <Footer />
            </body>
        </html>
    )

}
