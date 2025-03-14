"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createContext, useEffect } from "react";

export const AuthContext = createContext({});

export default function AuthContextProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (!session) {
            const currentPath = window.location.pathname;
            if (
                !currentPath.startsWith("/auth/login") &&
                !currentPath.startsWith("/auth/register")
            ) {
                router.push("/auth/login");
            }
        }
    }, [session, status, router]);

    return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
} 