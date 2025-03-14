 "use client";

import { useSession } from "next-auth/react";
import { createContext, useEffect } from "react";

export const ActiveContext = createContext({});

export default function ActiveContextProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();

    useEffect(() => {
        if (!session?.user?.email) return;

        // Here we would typically set up real-time presence tracking
        // For example, using Pusher to update user's online status
        // and subscribe to other users' status changes

    }, [session?.user?.email]);

    return <ActiveContext.Provider value={{}}>{children}</ActiveContext.Provider>;
}