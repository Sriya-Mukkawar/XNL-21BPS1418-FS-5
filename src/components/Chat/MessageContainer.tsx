"use client";

import { User } from "@prisma/client";
import axios from "axios";
import Image from "next/image";
import React from "react";
import Avatar from "react-avatar";
import { BsCheck2, BsCheck2All, BsTrash, BsThreeDotsVertical } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import { BiImage, BiMicrophone, BiStop, BiX } from "react-icons/bi";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

import { FullMessageType } from "@/lib/types";
import { formatMessageDate } from "@/lib/utils";
import { pusherClient } from "@/lib/pusher";

import VoiceMessage from "./VoiceMessage";

interface MessageProps {
	message: FullMessageType;
	isOwn: boolean;
	onDelete: () => void;
}

const Message = ({ message, isOwn, onDelete }: MessageProps) => {
	const [showDelete, setShowDelete] = React.useState(false);

	const renderContent = () => {
		const imageUrl = (message.image ?? '') as string;
		const videoUrl = (message.video ?? '') as string;
		const metadata = message.metadata ? JSON.parse(message.metadata) : null;
		const filter = metadata?.filter || 'none';
		
		if (message.type === 'video' && videoUrl) {
			console.log('Rendering video message:', { videoUrl, type: message.type });
			return (
				<div className="relative">
					<video 
						src={videoUrl} 
						controls 
						className="max-w-[300px] w-full rounded-lg"
						style={{ filter }}
						playsInline
					/>
					<div className="absolute inset-0 pointer-events-none rounded-lg bg-gradient-to-b from-black/5 to-black/20 dark:from-black/20 dark:to-black/40" />
				</div>
			);
		}
		if (message.audio) {
			return <VoiceMessage message={message} email={message.sender.email ?? ''} users={message.seen} />;
		}
		if (imageUrl) {
			const imageProps = {
				src: imageUrl,
				alt: `Message from ${message.sender.name || 'User'}`,
				width: 300,
				height: 300,
				className: "rounded-lg object-cover",
				unoptimized: true,
			} as const;
			return <Image {...imageProps} />;
		}
		return <span className="break-words">{message.body || ''}</span>;
	};

	return (
		<div
			className={`group flex w-fit max-w-[80%] flex-col gap-1 rounded-lg p-3 ${
				isOwn ? "ml-auto bg-blue-500 text-white" : "bg-gray-50 text-black dark:text-white dark:bg-gray-800"
			}`}
			onMouseEnter={() => setShowDelete(true)}
			onMouseLeave={() => setShowDelete(false)}
		>
			{!isOwn && (
				<span className="text-xs font-medium text-black dark:text-gray-400">
					{message.sender.name}
				</span>
			)}
			{renderContent()}
			<div className="flex items-center justify-between gap-2 text-xs opacity-70">
				<span className={isOwn ? "" : "text-black dark:text-gray-400"}>{formatMessageDate(message.createdAt)}</span>
				{isOwn && (
					<>
						{message.seen.length > 0 ? <BsCheck2All /> : <BsCheck2 />}
						{showDelete && (
							<button
								onClick={onDelete}
								className="text-red-500 hover:text-red-600"
							>
								<BsTrash />
							</button>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default function MessageContainer({
	users,
	id,
	messages,
	email,
}: {
	users: User[];
	id: string;
	messages: FullMessageType[];
	email: string;
}): React.JSX.Element {
	const bottomRef = React.useRef<HTMLDivElement>(null);
	const fileInputRef = React.useRef<HTMLInputElement>(null);
	const audioRef = React.useRef<HTMLAudioElement>(null);
	const [userScrolling, setUserScrolling] = React.useState<boolean>(false);
	const [newMessage, setNewMessage] = React.useState("");
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [localMessages, setLocalMessages] = React.useState<FullMessageType[]>(messages);
	const [isRecording, setIsRecording] = React.useState(false);
	const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null);
	const [audioChunks, setAudioChunks] = React.useState<Blob[]>([]);
	const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
	const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
	const [audioUrl, setAudioUrl] = React.useState<string | null>(null);

	// Update local messages when props messages change
	React.useEffect(() => {
		setLocalMessages(messages);
	}, [messages]);

	React.useEffect(() => {
		if (!email) return;

		// Subscribe to message deletion and chat clearing events
		pusherClient.subscribe(email);
		
		const handleMessageDelete = (messageId: string) => {
			setLocalMessages(prev => prev.filter(msg => msg.id !== messageId));
		};

		const handleChatClear = (data: { conversationId: string; clearedAt: string; clearedBy: string }) => {
			if (data.conversationId === id) {
				setLocalMessages([]);
				console.log(`Chat cleared by ${data.clearedBy} at ${data.clearedAt}`);
			}
		};

		pusherClient.bind("message:delete", handleMessageDelete);
		pusherClient.bind("chat:clear", handleChatClear);

		return () => {
			pusherClient.unsubscribe(email);
			pusherClient.unbind("message:delete", handleMessageDelete);
			pusherClient.unbind("chat:clear", handleChatClear);
		};
	}, [email, id]);

	React.useEffect(() => {
		void axios.post(`/api/conversations/${id}/seen`);
		if (bottomRef.current && !userScrolling) {
			bottomRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [localMessages, id, userScrolling]);

	const handleScroll = React.useCallback(() => {
		if (bottomRef.current) {
			const { scrollTop, scrollHeight, clientHeight } = bottomRef.current;
			setUserScrolling(scrollTop + clientHeight < scrollHeight);
		}
	}, []);

	React.useEffect(() => {
		const current = bottomRef.current;
		if (current) {
			current.addEventListener("scroll", handleScroll);
			return () => {
				current.removeEventListener("scroll", handleScroll);
			};
		}
	}, [handleScroll]);

	const handleDelete = async (messageId: string) => {
		try {
			// Remove message from local state immediately for optimistic update
			setLocalMessages(prev => prev.filter(msg => msg.id !== messageId));
			
			// Make the API call to delete the message
			await axios.delete(`/api/messages/${messageId}`);
		} catch (error) {
			console.error('Error deleting message:', error);
			// Restore the message if deletion fails
			setLocalMessages(prev => [...prev, messages.find(msg => msg.id === messageId)!].sort((a, b) => 
				new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newMessage.trim() || isSubmitting) return;

		const timestamp = new Date();
		const optimisticId = `temp-${timestamp.getTime()}`;
		const messageText = newMessage.trim();

		try {
			setIsSubmitting(true);
			// Clear input immediately
			setNewMessage("");
			
			// Add optimistic update
			const optimisticMessage: FullMessageType = {
				id: optimisticId,
				body: messageText,
				image: null,
				audio: null,
				video: null,
				type: null,
				metadata: null,
				createdAt: timestamp,
				seenIds: [],
				seen: [],
				sender: {
					id: 'temp',
					name: 'You',
					email: email,
					emailVerified: null,
					image: null,
					createdAt: timestamp,
					updatedAt: timestamp,
					hashedPassword: null,
					conversationIds: [],
					seenMessageIds: [],
					about: null,
					verificationCode: null,
					lastSeen: null,
				},
				senderId: 'temp',
				conversationId: id,
			};
			setLocalMessages(prev => [...prev, optimisticMessage]);
			
			// Send the actual message
			await axios.post(`/api/messages`, {
				message: messageText,
				conversationId: id,
			});
		} catch (error) {
			console.error('Error sending message:', error);
			// Restore the message if sending fails
			setNewMessage(messageText);
			// Remove the optimistic message on error
			setLocalMessages(prev => prev.filter(msg => msg.id !== optimisticId));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClearChat = async () => {
		try {
			// Clear messages locally first (optimistic update)
			setLocalMessages([]);
			
			// Make API call to clear the chat
			await axios.delete(`/api/conversations/${id}/messages`);
		} catch (error) {
			console.error('Error clearing chat:', error);
			// Restore messages if the operation fails
			setLocalMessages(messages);
		}
	};

	const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		setSelectedFile(file);
	};

	const sendFile = async () => {
		if (!selectedFile) return;

		try {
			setIsSubmitting(true);
			const formData = new FormData();
			formData.append('file', selectedFile);
			formData.append('conversationId', id);

			await axios.post('/api/messages/upload', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			// Clear the input and selected file
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
			setSelectedFile(null);
		} catch (error) {
			console.error('Error uploading file:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const recorder = new MediaRecorder(stream);
			setMediaRecorder(recorder);
			setAudioChunks([]);

			recorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					setAudioChunks(chunks => [...chunks, event.data]);
				}
			};

			recorder.onstop = () => {
				const blob = new Blob(audioChunks, { type: 'audio/webm' });
				setAudioBlob(blob);
				const url = URL.createObjectURL(blob);
				setAudioUrl(url);
				
				// Stop all tracks
				stream.getTracks().forEach(track => track.stop());
			};

			recorder.start();
			setIsRecording(true);
		} catch (error) {
			console.error('Error starting recording:', error);
		}
	};

	const stopRecording = () => {
		if (mediaRecorder && mediaRecorder.state !== 'inactive') {
			mediaRecorder.stop();
			setIsRecording(false);
		}
	};

	const sendAudio = async () => {
		if (!audioBlob) return;

		try {
			setIsSubmitting(true);
			const formData = new FormData();
			formData.append('file', audioBlob, 'audio.webm');
			formData.append('conversationId', id);

			await axios.post('/api/messages/upload', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			// Clear audio state
			setAudioBlob(null);
			setAudioUrl(null);
			setAudioChunks([]);
		} catch (error) {
			console.error('Error uploading audio:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const cancelFileSelection = () => {
		setSelectedFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const cancelAudioRecording = () => {
		setAudioBlob(null);
		setAudioUrl(null);
		setAudioChunks([]);
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
		}
	};

	return (
		<div className="flex h-full flex-col bg-white text-black dark:text-white dark:bg-gray-900">
			<div className="flex items-center justify-between border-b p-4 bg-white dark:bg-gray-900 dark:border-gray-700">
				<div className="flex items-center gap-2">
					{users.filter(user => user.email !== email).map((user) => (
						<div key={user.id} className="flex items-center gap-2">
							{user.image ? (
								<Image
									src={user.image}
									alt={user.name || "User"}
									width={40}
									height={40}
									className="rounded-full"
								/>
							) : (
								<Avatar
									name={user.name || "User"}
									size="40"
									round
								/>
							)}
							<span className="font-medium text-black dark:text-white">{user.name}</span>
						</div>
					))}
				</div>
				<Menu as="div" className="relative inline-block text-left">
					<Menu.Button className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800">
						<BsThreeDotsVertical className="h-5 w-5 text-black dark:text-gray-300" />
					</Menu.Button>
					<Transition
						as={Fragment}
						enter="transition ease-out duration-100"
						enterFrom="transform opacity-0 scale-95"
						enterTo="transform opacity-100 scale-100"
						leave="transition ease-in duration-75"
						leaveFrom="transform opacity-100 scale-100"
						leaveTo="transform opacity-0 scale-95"
					>
						<Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-gray shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:divide-gray-700">
							<div className="px-1 py-1">
								<Menu.Item>
									{({ active }) => (
										<button
											onClick={handleClearChat}
											className={`${
												active ? 'bg-red-500 text-white' : 'text-red-500'
											} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
										>
											<BsTrash className="mr-2 h-5 w-5" />
											Clear Chat
										</button>
									)}
								</Menu.Item>
							</div>
						</Menu.Items>
					</Transition>
				</Menu>
			</div>

			<div className="flex-1 overflow-y-auto space-y-4 bg-gray-100 dark:bg-gray-900 p-4">
				{localMessages.map((message) => (
					<Message
						key={message.id}
						message={message}
						isOwn={message.sender.email === email}
						onDelete={() => handleDelete(message.id)}
					/>
				))}
				<div ref={bottomRef} />
			</div>

			{(selectedFile || audioUrl) && (
				<div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							{selectedFile && (
								<>
									<BiImage size={24} className="text-blue-500" />
									<span className="text-sm">{selectedFile.name}</span>
								</>
							)}
							{audioUrl && (
								<>
									<BiMicrophone size={24} className="text-blue-500" />
									<audio ref={audioRef} src={audioUrl} controls className="h-8" />
								</>
							)}
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={selectedFile ? cancelFileSelection : cancelAudioRecording}
								className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
							>
								<BiX size={24} />
							</button>
							<button
								onClick={selectedFile ? sendFile : sendAudio}
								disabled={isSubmitting}
								className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
							>
								Send
							</button>
						</div>
					</div>
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="sticky bottom-0 flex items-center gap-2 border-t bg-white dark:border-gray-700 dark:bg-gray-900"
			>
				<input
					type="file"
					ref={fileInputRef}
					onChange={handleFileUpload}
					className="hidden"
					accept="image/*,video/*,audio/*,application/pdf"
				/>
				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					disabled={isSubmitting || isRecording || !!selectedFile || !!audioUrl}
					className="text-black hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 ml-4 disabled:opacity-50"
				>
					<BiImage size={24} />
				</button>
				<button
					type="button"
					onClick={isRecording ? stopRecording : startRecording}
					disabled={isSubmitting || !!selectedFile || !!audioUrl}
					className="text-black hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50"
				>
					{isRecording ? <BiStop size={24} className="text-red-500" /> : <BiMicrophone size={24} />}
				</button>
				<input
					type="text"
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					placeholder="Type a message"
					className="flex-1 rounded-lg bg-white text-black placeholder-gray-500 px-4 py-2 focus:outline-none dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 mx-2"
				/>
				<button
					type="submit"
					disabled={!newMessage.trim() || isSubmitting || isRecording}
					className="text-blue-500 hover:text-blue-600 disabled:opacity-50 mr-4"
				>
					<IoSend size={24} />
				</button>
			</form>
		</div>
	);
}
