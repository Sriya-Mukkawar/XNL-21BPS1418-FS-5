import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { UserSession } from "@/lib/model";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions)!;
		if (!session.user?.email) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const formData = await request.formData();
		const file = formData.get("file") as File;
		const conversationId = formData.get("conversationId") as string;

		if (!file || !conversationId) {
			return new NextResponse("Missing required fields", { status: 400 });
		}

		// Convert file to base64
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);
		const base64 = buffer.toString("base64");

		// Get current user
		const currentUser = await prisma.user.findUnique({
			where: {
				email: session.user.email,
			},
		});

		if (!currentUser) {
			return new NextResponse("User not found", { status: 404 });
		}

		// Determine message type based on file mime type
		const type = file.type.split("/")[0]; // 'image', 'video', 'audio', etc.

		// Create message with the appropriate type and content
		const message = await prisma.message.create({
			include: {
				sender: true,
				seen: true,
			},
			data: {
				conversationId,
				senderId: currentUser.id,
				[type]: `data:${file.type};base64,${base64}`,
				type,
			},
		});

		// Update conversation's lastMessageAt
		await prisma.conversation.update({
			where: {
				id: conversationId,
			},
			data: {
				lastMessageAt: new Date(),
				messages: {
					connect: {
						id: message.id,
					},
				},
			},
			include: {
				users: true,
				messages: {
					include: {
						seen: true,
					},
				},
			},
		});

		// Trigger Pusher events
		await pusherServer.trigger(conversationId, "messages:new", message);

		const lastMessage = message;

		// Update all conversation users
		message.sender.email &&
			(await pusherServer.trigger(message.sender.email, "conversation:update", {
				id: conversationId,
				messages: [lastMessage],
			}));

		return NextResponse.json(message);
	} catch (error: any) {
		console.log("[MESSAGES_UPLOAD]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
