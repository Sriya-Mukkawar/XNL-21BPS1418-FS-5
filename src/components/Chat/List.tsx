/* eslint-disable @typescript-eslint/no-unnecessary-condition */
"use client";

import { find } from "lodash";
import { useSession } from "next-auth/react";
import React from "react";
import { BiFilter } from "react-icons/bi";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useRecoilState } from "recoil";

import { UserSession } from "@/lib/model";
import { pusherClient } from "@/lib/pusher";
import { FullConversationType } from "@/lib/types";
import { conversationState } from "@/components/atoms/conversationState";

import ChatListItem from "./ChatListItem";

export default function List({ conversation }: { conversation: FullConversationType[] }): React.JSX.Element {
	const [activeConversationId, setActiveConversationId] = useRecoilState(conversationState);
	const { data: session } = useSession() as { data: UserSession | undefined };
	const [conversations, setConversations] = React.useState<FullConversationType[]>(conversation);
	const searchRef = React.useRef<HTMLInputElement>(null);
	const [searchResults, setSearchResults] = React.useState<FullConversationType[]>([]);

	React.useEffect(() => {
		setConversations(conversation);
	}, [conversation]);

	React.useEffect(() => {
		if (!session?.user?.email) return;
		pusherClient.subscribe(session?.user?.email);
		const newHandler = (data: FullConversationType): void => {
			setConversations((prev) => {
				if (find(prev, { id: data.id })) return prev;
				return [data, ...prev];
			});
		};
		const updateHandler = (data: FullConversationType): void => {
			setConversations((prev) =>
				prev.map((conversation) => {
					if (conversation.id === data.id) {
						const dataTime = new Date(data.messages[data.messages.length - 1].createdAt);
						const messages = conversation?.messages || [];
						const messagesIds = conversation?.messagesIds || [];
						let lastMessageAt = conversation?.lastMessageAt;
						try {
							lastMessageAt = lastMessageAt.getTime() > dataTime.getTime() ? lastMessageAt : dataTime;
						} catch (error) {
							lastMessageAt = dataTime;
						}
						return {
							...conversation,
							messages: [...messages, data.messages[data.messages.length - 1]],
							messagesIds: [...messagesIds, data.messages[data.messages.length - 1].id],
							lastMessageAt: lastMessageAt,
						};
					}
					return conversation;
				})
			);
			setConversations((prev) =>
				prev.sort((a, b) => {
					const aTime = new Date(a?.lastMessageAt || a.createdAt);
					const bTime = new Date(b?.lastMessageAt || b.createdAt);
					return bTime.getTime() - aTime.getTime();
				})
			);
		};
		const deleteHandler = (data: FullConversationType): void => {
			setConversations((prev) => {
				return [...prev.filter((conversation) => conversation.id !== data.id)];
			});
		};
		pusherClient.bind("conversation:new", newHandler);
		pusherClient.bind("conversation:update", updateHandler);
		pusherClient.bind("conversation:remove", deleteHandler);
		return () => {
			if (!session?.user?.email) return;
			pusherClient.unsubscribe(session?.user?.email);
			pusherClient.unbind("conversation:new", newHandler);
			pusherClient.unbind("conversation:update", updateHandler);
			pusherClient.unbind("conversation:remove", deleteHandler);
		};
	}, []);
	const handleSearch = (): void => {
		if (!searchRef.current) return;
		const value = searchRef.current.value;
		if (value.trim().length === 0) {
			setSearchResults([]);
			return;
		}
		const results = conversations.filter((conversation) =>
			String(
				conversation.isGroup
					? conversation.name
					: conversation.users.filter((user) => user.email !== session?.user?.email)[0].name
			)
				.toLowerCase()
				.includes(value.toLowerCase())
		);
		setSearchResults(results);
	};
	return (
		<div className="flex flex-col h-full bg-white dark:bg-gray-900">
			<div className="flex h-14 items-center bg-white dark:bg-gray-900 sticky top-0 z-10">
				<div className="flex flex-grow items-center gap-7 rounded-lg bg-gray-100 px-4 py-1.5 dark:bg-gray-800 mx-4">
					<div>
						<FaMagnifyingGlass className="cursor-pointer text-sm text-[#54656f] dark:text-[#aebac1]" />
					</div>
					<div>
						<input
							ref={searchRef}
							onChange={handleSearch}
							type="text"
							placeholder="Search or start new chat"
							className="w-full bg-transparent text-sm text-[#54656f] placeholder-[#54656f] outline-none dark:text-[#aebac1] dark:placeholder-[#aebac1]"
						/>
					</div>
				</div>
				<div className="pl-3 pr-5">
					<BiFilter className="cursor-pointer text-xl text-[#54656f] dark:text-[#aebac1]" />
				</div>
			</div>
			<div className="flex-1 overflow-y-auto border-t border-[#e9edef] scrollbar-thin scrollbar-thumb-gray-300 dark:border-[#313d45] dark:scrollbar-thumb-gray-700 bg-white dark:bg-gray-900">
				<div className="flex flex-col">
					{session &&
						searchResults.length === 0 &&
						conversations.map((conversation: FullConversationType) => (
							<ChatListItem
								conversation={conversation}
								key={conversation.id}
								email={String(session.user?.email)}
							/>
						))}
					{session &&
						searchResults.length > 0 &&
						searchResults.map((conversation: FullConversationType) => (
							<ChatListItem
								conversation={conversation}
								key={conversation.id}
								email={String(session.user?.email)}
							/>
						))}
				</div>
			</div>
		</div>
	);
}
