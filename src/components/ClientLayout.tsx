"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { RecoilRoot } from "recoil";
import AuthContextProvider from "@/context/AuthContext";
import ActiveContextProvider from "@/context/ActiveContext";
import Navbar from "@/components/Navbar";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <RecoilRoot>
                <ThemeProvider attribute="class">
                    <AuthContextProvider>
                        <ActiveContextProvider>
                            <Navbar />
                            <main className="container mx-auto mt-16 px-4">
                                {children}
                            </main>
                        </ActiveContextProvider>
                    </AuthContextProvider>
                </ThemeProvider>
            </RecoilRoot>
        </SessionProvider>
    );
} 