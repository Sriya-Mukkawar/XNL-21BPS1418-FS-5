"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { useRecoilState } from "recoil";
import Image from "next/image";
import { TbUsers, TbDotsVertical } from "react-icons/tb";
import { BiSolidCircle } from "react-icons/bi";
import { useSession } from "next-auth/react";

import getConversations from "@/actions/getConversations";
import { FullConversationType } from "@/lib/types";

import { conversationState } from "../atoms/conversationState";
import { sideBarState } from "../atoms/sideBar";
import ChatListHeader from "./ChatListHeader";
import ContactList from "./ContactList";
import List from "./List";

export default function ChatList(): React.JSX.Element {
	const ConversationState = useRecoilState(conversationState)[0];
	const pageType = useRecoilState(sideBarState)[0];
	const [conversations, setConversations] = React.useState<FullConversationType[]>([]);
	const { data: session } = useSession();

	React.useEffect(() => {
		async function getData(): Promise<void> {
			const data = await getConversations();
			setConversations(data);
		}
		void getData();
	}, []);

	return (
		<div className="h-screen bg-white dark:bg-gray-900">
			<div className="flex h-14 items-center justify-between bg-white px-4 dark:bg-gray-900">
				<div className="flex items-center gap-4">
					<Image
						src={session?.user?.image || "/images/placeholder.jpg"}
						alt="Profile"
						width={40}
						height={40}
						className="rounded-full"
					/>
				</div>
				<div className="flex items-center gap-6">
					<div>
						<TbUsers className="cursor-pointer text-xl text-[#54656f] dark:text-[#aebac1]" />
					</div>
					<div>
						<BiSolidCircle className="cursor-pointer text-xl text-[#54656f] dark:text-[#aebac1]" />
					</div>
					<div>
						<TbDotsVertical className="cursor-pointer text-xl text-[#54656f] dark:text-[#aebac1]" />
					</div>
				</div>
			</div>
			<div className="h-[calc(100vh-56px)]">
				<List conversation={conversations} />
			</div>
		</div>
	);
}
