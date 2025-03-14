import { Conversation, Message, User } from "@prisma/client";

export type FullMessageType = Message & {
	sender: User;
	seen: User[];
	metadata?: string | null;
	video?: string | null;
};

export type FullConversationType = Conversation & {
	users: User[];
	messages: FullMessageType[];
};
