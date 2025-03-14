import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function DELETE(request: Request, { params }: { params: { messageId: string } }) {
	try {
		const session = await getServerSession(authOptions);
		const { messageId } = params;

		if (!session?.user?.email) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		// Find the message and include the conversation
		const message = await prisma.message.findUnique({
			where: {
				id: messageId,
			},
			include: {
				conversation: {
					include: {
						users: true,
					},
				},
			},
		});

		if (!message) {
			return new NextResponse("Message not found", { status: 404 });
		}

		// Delete the message
		await prisma.message.delete({
			where: {
				id: messageId,
			},
		});

		// Notify all users in the conversation about the deleted message
		message.conversation.users.forEach(async (user) => {
			if (user.email) {
				await pusherServer.trigger(user.email, "message:delete", messageId);
			}
		});

		return NextResponse.json({ message: "Message deleted successfully" });
	} catch (error) {
		console.error("Error deleting message:", error);
		return new NextResponse("Error", { status: 500 });
	}
}
