"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import Link from "next/link";

export default function HomePage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	React.useEffect(() => {
		if (status === "authenticated") {
			router.push("/chat");
		}
	}, [status, router]);

	if (status === "loading") {
		return (
			<div className="flex h-screen items-center justify-center">
				<p className="text-gray-500">Loading...</p>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
			<div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
				<h1 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
					Welcome to Video Chat App
				</h1>
				<div className="space-y-4">
					<Link
						href="/auth/login"
						className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
					>
						Login
					</Link>
					<Link
						href="/auth/register"
						className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-center text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
					>
						Sign Up
					</Link>
					<div className="relative my-4">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
								Or continue with
							</span>
						</div>
					</div>
					<button
						onClick={() => router.push("/auth/login?provider=google")}
						className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
					>
						<svg className="h-5 w-5" viewBox="0 0 24 24">
							<path
								fill="currentColor"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="currentColor"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="currentColor"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="currentColor"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						Continue with Google
					</button>
				</div>
			</div>
		</div>
	);
}
