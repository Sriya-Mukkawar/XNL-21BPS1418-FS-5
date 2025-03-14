"use client";

import React from "react";
import { BiVideo } from "react-icons/bi";

export default function LoadingAnimation(): React.JSX.Element {
	return (
		<div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
			<div className="flex flex-col items-center gap-4">
				<div className="relative">
					<BiVideo className="h-16 w-16 animate-pulse text-blue-500 dark:text-blue-400" />
					<div className="absolute -right-1 -top-1 h-4 w-4 animate-bounce rounded-full bg-green-500"></div>
				</div>
				<div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
					Connecting to Video Chat...
				</div>
			</div>
		</div>
	);
} 
