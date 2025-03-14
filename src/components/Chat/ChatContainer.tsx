"use client";

import { useSession } from "next-auth/react";
import React from "react";

import { UserSession } from "@/lib/model";
import { FullConversationType, FullMessageType } from "@/lib/types";

import MessageBar from "./MessageBar";
import MessageContainer from "./MessageContainer";

export default function ChatContainer({
	conversation,
	messages,
}: {
	conversation: FullConversationType | null;
	messages: FullMessageType[];
}): React.JSX.Element {
	const { data: session } = useSession() as { data: UserSession | undefined };

	return (
		<div className="flex h-screen w-full flex-col bg-gray-50">
			<div className="flex-1 overflow-y-auto">
				<MessageContainer
					users={conversation?.users ?? []}
					id={conversation?.id ?? ""}
					messages={messages}
					email={session?.user?.email ?? ""}
				/>
			</div>
			<MessageBar id={conversation?.id ?? ""} />
		</div>
	);
}
