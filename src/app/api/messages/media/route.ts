import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const formData = await request.formData();
		const fileType = (formData.get("type") as string) || "video/webm;codecs=vp9,opus";
		const file = formData.get("file") as File;
		const recipientId = formData.get("recipientId") as string;
		const filter = formData.get("filter") as string;
		const metadata = filter ? JSON.stringify({ filter }) : null;

		if (!file) {
			return new NextResponse("No file provided", { status: 400 });
		}

		const isVideo = fileType.startsWith("video");
		const isAudio = fileType.startsWith("audio");
		const isImage = fileType.startsWith("image");

		const user = await prisma.user.findUnique({
			where: {
				email: session.user.email,
			},
		});

		if (!user) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		// Get or create conversation
		let conversation = await prisma.conversation.findFirst({
			where: {
				OR: [
					{
						userIds: {
							equals: [user.id, recipientId],
						},
					},
					{
						userIds: {
							equals: [recipientId, user.id],
						},
					},
				],
			},
		});

		if (!conversation) {
			conversation = await prisma.conversation.create({
				data: {
					userIds: [user.id, recipientId],
				},
			});
		}

		// Convert blob to base64
		const buffer = await file.arrayBuffer();
		const base64 = Buffer.from(buffer).toString("base64");
		const dataUrl = `data:${fileType};base64,${base64}`;

		// Create message with metadata including the filter
		const message = await prisma.message.create({
			include: {
				sender: true,
				seen: true,
			},
			data: {
				body: "",
				type: isVideo ? "video" : isAudio ? "audio" : "image",
				metadata: filter ? JSON.stringify({ filter }) : null,
				conversation: {
					connect: { id: conversation.id },
				},
				sender: {
					connect: { email: session.user.email },
				},
				image: isImage ? `data:${fileType};base64,${base64}` : null,
				audio: isAudio ? `data:${fileType};base64,${base64}` : null,
				video: isVideo ? `data:${fileType};base64,${base64}` : null,
			},
		});

		return NextResponse.json(message);
	} catch (error) {
		console.error("Error in media upload:", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
