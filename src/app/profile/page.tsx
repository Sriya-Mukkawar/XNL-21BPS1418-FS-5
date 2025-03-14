"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { UserSession } from "@/lib/model";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function ProfilePage(): React.JSX.Element {
  const { data: session } = useSession() as { data: UserSession | undefined };

  if (!session?.user) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Not signed in</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "Profile"}
                width={100}
                height={100}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-500 text-2xl text-white">
                {session.user.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <h1 className="mb-2 text-2xl font-bold">{session.user.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">{session.user.email}</p>
          
          <div className="mt-6">
            <Button
              onClick={() => void signOut()}
              variant="destructive"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 