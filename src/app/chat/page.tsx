"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRecoilState } from "recoil";
import { find } from "lodash";

import { UserSession } from "@/lib/model";
import { FullConversationType } from "@/lib/types";
import { conversationState } from "@/components/atoms/conversationState";
import { messageSearch } from "@/components/atoms/messageSearch";
import getConversations from "@/actions/getConversations";
import getConversationById from "@/actions/getConversationbyId";
import List from "@/components/Chat/List";
import MessageContainer from "@/components/Chat/MessageContainer";
import SearchMessages from "@/components/Chat/SearchMessages";
import { pusherClient } from "@/lib/pusher";

export default function ChatPage(): React.JSX.Element {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [conversations, setConversations] = React.useState<FullConversationType[]>([]);
	const [messages, setMessages] = React.useState<FullConversationType["messages"]>([]);
	const [conversation, setConversation] = React.useState<FullConversationType | null>(null);
	const [activeConversationId, setActiveConversationId] = useRecoilState(conversationState);
	const [isMessageSearch, setIsMessageSearch] = useRecoilState(messageSearch);

	React.useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/");
		}
	}, [status, router]);

	// Fetch initial conversations
	React.useEffect(() => {
		async function fetchConversations() {
			if (!session?.user?.email) {
				console.log("No session or email found");
				return;
			}
			console.log("Fetching conversations for user:", session.user.email);
			try {
				const data = await getConversations();
				console.log("Fetched conversations:", data);
				setConversations(data);
			} catch (error) {
				console.error("Error fetching conversations:", error);
			}
		}
		void fetchConversations();
	}, [session?.user?.email]);

	// Subscribe to conversation updates
	React.useEffect(() => {
		const userEmail = session?.user?.email;
		if (!userEmail) {
			console.log("No user email for Pusher subscription");
			return;
		}

		console.log("Subscribing to Pusher channel:", userEmail);
		pusherClient.subscribe(userEmail);

		const newHandler = (conversation: FullConversationType) => {
			console.log("New conversation received:", conversation);
			setConversations((current) => {
				if (find(current, { id: conversation.id })) {
					return current;
				}
				return [conversation, ...current];
			});
		};

		const updateHandler = (conversation: FullConversationType) => {
			console.log("Conversation update received:", conversation);
			setConversations((current) =>
				current.map((currentConversation) => {
					if (currentConversation.id === conversation.id) {
						return {
							...currentConversation,
							messages: conversation.messages,
						};
					}
					return currentConversation;
				})
			);
		};

		const removeHandler = (conversation: FullConversationType) => {
			console.log("Conversation remove received:", conversation);
			setConversations((current) => {
				return [...current.filter((conv) => conv.id !== conversation.id)];
			});
		};

		pusherClient.bind("conversation:new", newHandler);
		pusherClient.bind("conversation:update", updateHandler);
		pusherClient.bind("conversation:remove", removeHandler);

		return () => {
			console.log("Unsubscribing from Pusher channel:", userEmail);
			pusherClient.unsubscribe(userEmail);
			pusherClient.unbind("conversation:new", newHandler);
			pusherClient.unbind("conversation:update", updateHandler);
			pusherClient.unbind("conversation:remove", removeHandler);
		};
	}, [session?.user?.email]);

	// Fetch selected conversation
	React.useEffect(() => {
		if (!activeConversationId) {
			setConversation(null);
			setMessages([]);
			return;
		}
		async function fetchConversation() {
			try {
				console.log("Fetching conversation by ID:", activeConversationId);
				const data = await getConversationById(activeConversationId);
				console.log("Fetched conversation data:", data);
				setConversation(data);
				setMessages(data?.messages ?? []);
			} catch (error) {
				console.error("Error fetching conversation:", error);
			}
		}
		void fetchConversation();
	}, [activeConversationId]);

	if (status === "loading") {
		return (
			<div className="flex h-full items-center justify-center">
				<p className="text-gray-500">Loading...</p>
			</div>
		);
	}

	if (!session) {
		return (
			<div className="flex h-full items-center justify-center">
				<p className="text-gray-500">Please sign in to view conversations</p>
			</div>
		);
	}

	console.log("Rendering chat page with conversations:", conversations);
	return (
		<div className="h-[calc(100vh-4rem)] overflow-hidden">
			<div className="grid h-full grid-cols-1 lg:grid-cols-4">
				<div className="border-r dark:border-gray-700">
					<List conversation={conversations} />
				</div>
				<div className="lg:col-span-3">
					{conversation ? (
						<MessageContainer
							users={conversation.users}
							id={conversation.id}
							messages={messages}
							email={session?.user?.email ?? ""}
						/>
					) : (
						<div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
							Select a conversation to start chatting
						</div>
					)}
				</div>
			</div>
			{isMessageSearch && conversation && (
				<div className="fixed right-0 top-0 h-full w-full border-l bg-white dark:border-gray-700 dark:bg-gray-900 lg:w-1/3">
					<SearchMessages messages={messages} />
				</div>
			)}
		</div>
	);
}
