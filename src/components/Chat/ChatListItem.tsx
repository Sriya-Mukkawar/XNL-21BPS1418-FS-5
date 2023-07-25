/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
"use client";

import { format } from "date-fns";
import Image from "next/image";
import React from "react";
import Avatar from "react-avatar";
import { useRecoilState } from "recoil";

import { FullConversationType } from "@/lib/types";

import { conversationState } from "../atoms/conversationState";
import AvatarGroup from "../AvatarGroup";

export default function ChatListItem({
	conversation,
	email,
}: {
	conversation: FullConversationType;
	email: string;
}): React.JSX.Element {
	const [conversationId, setconversationId] = useRecoilState(conversationState);
	const lastMessage = React.useMemo(() => {
		const messages = conversation.messages || [];

		return messages[messages.length - 1];
	}, [conversation.messages]);
	const hasSeen = React.useMemo(() => {
		if (!lastMessage) {
			return false;
		}

		const seenArray = lastMessage.seen || [];

		if (!email) {
			return false;
		}

		return seenArray.filter((user) => user.email === email).length !== 0;
	}, [email, lastMessage]);
	const lastMessageText = React.useMemo(() => {
		if (lastMessage?.image) {
			return "Sent an image";
		}

		if (lastMessage?.body) {
			return lastMessage?.body;
		}

		return "Started a conversation";
	}, [lastMessage]);
	const unseenMessages = React.useMemo(() => {
		if (!conversation.messages) {
			return 0;
		}
		const unseen = conversation.messages.filter(
			(message) => !message.seen?.filter((user) => user.email === email).length
		);
		return unseen.length;
	}, [conversation.messages, email]);
	return (
		<div
			onClick={(): void => {
				setconversationId(conversation.id);
			}}
			key={conversation.id}
			className={`flex h-[70px] w-full cursor-pointer flex-row items-center justify-between px-4 transition-all duration-300 ease-in-out hover:bg-[#f0f2f5] dark:hover:bg-[#222e35] ${
				conversationId === conversation.id ? "bg-[#f0f2f5] dark:bg-[#222e35]" : ""
			}`}>
			<div className="flex h-full w-full items-center space-x-4">
				{conversation.isGroup ? (
					<AvatarGroup conversation={conversation} users={conversation.users} />
				) : conversation.users.filter((user) => user.email !== email)[0]?.image ? (
					<Image
						src={conversation.users.filter((user) => user.email !== email)[0]?.image || "/user.png"}
						alt="Profile"
						width={40}
						height={40}
						className="h-15 w-15 cursor-pointer rounded-full object-contain"
					/>
				) : (
					<Avatar
						name={conversation.users.filter((user) => user.email !== email)[0]?.name ?? ""}
						size="40"
						className="h-12 w-12 cursor-pointer rounded-full object-contain p-0"
					/>
				)}
				<div className="flex h-full w-full flex-row justify-between border-y">
					<div className="flex h-full flex-col justify-center">
						<span className="text-md font-semibold text-[#1d2129] dark:text-[#e4e6eb]">
							{conversation.name || conversation.users.filter((user) => user.email !== email)[0]?.name}
							<span
								className={`mt-1 line-clamp-1 text-xs ${
									// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
									hasSeen
										? "font-normal text-[#54656f] dark:text-[#aebac1]"
										: "font-semibold text-black dark:text-white"
								}`}>
								{lastMessageText}
							</span>
						</span>
					</div>
					{lastMessage?.createdAt && (
						<div className="flex flex-col items-end justify-center space-y-2">
							<span className="text-xs font-normal text-[#54656f] dark:text-[#aebac1]">
								{format(new Date(lastMessage?.createdAt), "p")}
							</span>
							{unseenMessages > 0 && (
								<span className="flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-green-600 text-[8px] text-white">
									{unseenMessages}
								</span>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
