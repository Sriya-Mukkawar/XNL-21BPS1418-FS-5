"use client";

import React, { useState } from "react";
import { BiMicrophone, BiSun, BiMoon } from "react-icons/bi";
import { BsFillCameraVideoFill } from "react-icons/bs";
import { useTheme } from "next-themes";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VideoRecorder } from "@/components/VideoRecorder";
import { AudioRecorder } from "@/components/AudioRecorder";
import { ShareModal } from "@/components/ShareModal";

export default function ChatHeader(): React.JSX.Element {
	const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
	const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
	const [isShareModalOpen, setIsShareModalOpen] = useState(false);
	const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
	const { theme, setTheme } = useTheme();

	const handleShare = async (userId: string) => {
		if (!mediaBlob) return;

		try {
			const formData = new FormData();
			formData.append('file', mediaBlob);
			formData.append('recipientId', userId);

			await fetch('/api/messages/media', {
				method: 'POST',
				body: formData,
			});
			setMediaBlob(null);
			setIsShareModalOpen(false);
		} catch (error) {
			console.error('Error sharing media:', error);
		}
	};

	return (
		<div className="z-20 flex h-16 w-full items-center justify-between bg-white px-4 py-4 shadow-sm dark:bg-gray-800 dark:text-white">
			<div className="flex items-center space-x-4">
				<h1 className="text-xl font-semibold">Video Messenger</h1>
			</div>
			<div className="flex items-center space-x-4">
				<button
					onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
					className="rounded-full bg-gray-200 p-3 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
				>
					{theme === 'dark' ? <BiSun className="h-5 w-5" /> : <BiMoon className="h-5 w-5" />}
				</button>
				<button
					onClick={() => setIsAudioModalOpen(true)}
					className="rounded-full bg-blue-500 p-3 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
				>
					<BiMicrophone className="h-5 w-5" />
				</button>
				<button
					onClick={() => setIsVideoModalOpen(true)}
					className="rounded-full bg-blue-500 p-3 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
				>
					<BsFillCameraVideoFill className="h-5 w-5" />
				</button>
			</div>

			{isVideoModalOpen && (
				<Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Record Video</DialogTitle>
						</DialogHeader>
						<VideoRecorder
							onShare={(blob: Blob) => {
								setMediaBlob(blob);
								setIsVideoModalOpen(false);
								setIsShareModalOpen(true);
							}}
						/>
					</DialogContent>
				</Dialog>
			)}

			{isAudioModalOpen && (
				<Dialog open={isAudioModalOpen} onOpenChange={setIsAudioModalOpen}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Record Audio</DialogTitle>
						</DialogHeader>
						<AudioRecorder
							onShare={(blob: Blob) => {
								setMediaBlob(blob);
								setIsAudioModalOpen(false);
								setIsShareModalOpen(true);
							}}
						/>
					</DialogContent>
				</Dialog>
			)}

			<ShareModal
				isOpen={isShareModalOpen}
				onClose={() => setIsShareModalOpen(false)}
				onShare={handleShare}
			/>
		</div>
	);
}
