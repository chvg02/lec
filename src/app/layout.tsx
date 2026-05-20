"use client";
import { Footer } from "../components/footer"
import { Header } from "../components/header"
import { Geist, Geist_Mono } from "next/font/google";
import '@/styles/globals.css'

import NextAuthSessionProvider from "@/components/providers/sessionProviders";
// import { HeaderPrivate } from "@/components/headerPrivate";
// import { useSession } from "next-auth/react";

type LayoutProps = {
    children: React.ReactNode;
}

const geistSans = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
})


export default function Layout({ children }: LayoutProps) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased relative flex w-full min-h-screen flex-col`}>
                <NextAuthSessionProvider>
                    <Header />
                    <main className="flex-1 flex flex-col mt-16">
                        {children}
                    </main>
                    <Footer />
                </NextAuthSessionProvider>
            </body>
        </html>
    )

}
