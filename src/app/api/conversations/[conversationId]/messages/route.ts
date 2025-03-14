import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function DELETE(request: Request, { params }: { params: { conversationId: string } }) {
	try {
		const session = await getServerSession(authOptions);
		const { conversationId } = params;

		if (!session?.user?.email) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		// Find the conversation and include users
		const conversation = await prisma.conversation.findUnique({
			where: {
				id: conversationId,
			},
			include: {
				users: true,
			},
		});

		if (!conversation) {
			return new NextResponse("Conversation not found", { status: 404 });
		}

		// Delete all messages in the conversation
		await prisma.message.deleteMany({
			where: {
				conversationId,
			},
		});

		// Notify all users in the conversation about the cleared chat
		const notificationData = {
			conversationId,
			clearedAt: new Date().toISOString(),
			clearedBy: session.user.email,
		};

		conversation.users.forEach(async (user) => {
			if (user.email) {
				await pusherServer.trigger(user.email, "chat:clear", notificationData);
			}
		});

		return NextResponse.json({ message: "Chat cleared successfully" });
	} catch (error) {
		console.error("Error clearing chat:", error);
		return new NextResponse("Error", { status: 500 });
	}
}
