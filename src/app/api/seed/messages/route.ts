import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // First delete existing conversations and messages to start fresh
        console.log("Deleting existing messages and conversations...");
        await prisma.message.deleteMany();
        await prisma.conversation.deleteMany();

        // Reset user conversation IDs
        console.log("Resetting user conversation IDs...");
        await prisma.user.updateMany({
            data: {
                conversationIds: []
            }
        });

        // Get all users
        console.log("Fetching users...");
        const users = await prisma.user.findMany();
        console.log("Found users:", users.length);
        
        if (users.length < 2) {
            return new NextResponse("Not enough users to create conversations", { status: 400 });
        }

        // Create one-on-one conversation first
        console.log("Creating one-on-one conversation...");
        const oneOnOneConversation = await prisma.conversation.create({
            data: {
                users: {
                    connect: [
                        { id: users[0].id },
                        { id: users[1].id }
                    ]
                }
            }
        });

        // Update users with conversation ID
        console.log("Updating users with one-on-one conversation ID...");
        await Promise.all([
            prisma.user.update({
                where: { id: users[0].id },
                data: { conversationIds: { push: oneOnOneConversation.id } }
            }),
            prisma.user.update({
                where: { id: users[1].id },
                data: { conversationIds: { push: oneOnOneConversation.id } }
            })
        ]);

        // Create messages for one-on-one conversation
        console.log("Creating one-on-one messages...");
        const oneOnOneMessages = await Promise.all([
            prisma.message.create({
                data: {
                    body: "Hey there! How are you?",
                    conversation: { connect: { id: oneOnOneConversation.id } },
                    sender: { connect: { id: users[0].id } },
                    seen: { connect: [{ id: users[0].id }] }
                }
            }),
            prisma.message.create({
                data: {
                    body: "I'm doing great! Just checking out this new video app",
                    conversation: { connect: { id: oneOnOneConversation.id } },
                    sender: { connect: { id: users[1].id } },
                    seen: { connect: [{ id: users[1].id }] }
                }
            }),
            prisma.message.create({
                data: {
                    body: "Have you tried the video recording feature?",
                    conversation: { connect: { id: oneOnOneConversation.id } },
                    sender: { connect: { id: users[0].id } },
                    seen: { connect: [{ id: users[0].id }] }
                }
            })
        ]);

        // Create group conversation
        console.log("Creating group conversation...");
        const groupConversation = await prisma.conversation.create({
            data: {
                name: "Video App Team",
                isGroup: true,
                users: {
                    connect: users.slice(0, 3).map(user => ({ id: user.id }))
                }
            }
        });

        // Update users with group conversation ID
        console.log("Updating users with group conversation ID...");
        await Promise.all(
            users.slice(0, 3).map(user =>
                prisma.user.update({
                    where: { id: user.id },
                    data: { conversationIds: { push: groupConversation.id } }
                })
            )
        );

        // Create messages for group
        console.log("Creating group messages...");
        const groupMessages = await Promise.all([
            prisma.message.create({
                data: {
                    body: "Welcome everyone to our video app group!",
                    conversation: { connect: { id: groupConversation.id } },
                    sender: { connect: { id: users[0].id } },
                    seen: { connect: [{ id: users[0].id }] }
                }
            }),
            prisma.message.create({
                data: {
                    body: "Thanks for adding me! This app looks great",
                    conversation: { connect: { id: groupConversation.id } },
                    sender: { connect: { id: users[1].id } },
                    seen: { connect: [{ id: users[1].id }] }
                }
            }),
            prisma.message.create({
                data: {
                    body: "Let's share some videos here!",
                    conversation: { connect: { id: groupConversation.id } },
                    sender: { connect: { id: users[2].id } },
                    seen: { connect: [{ id: users[2].id }] }
                }
            })
        ]);

        // Update conversations with lastMessageAt
        console.log("Updating conversation timestamps...");
        const [updatedOneOnOne, updatedGroup] = await Promise.all([
            prisma.conversation.update({
                where: { id: oneOnOneConversation.id },
                data: { lastMessageAt: new Date() },
                include: {
                    users: true,
                    messages: {
                        include: {
                            sender: true,
                            seen: true
                        }
                    }
                }
            }),
            prisma.conversation.update({
                where: { id: groupConversation.id },
                data: { lastMessageAt: new Date() },
                include: {
                    users: true,
                    messages: {
                        include: {
                            sender: true,
                            seen: true
                        }
                    }
                }
            })
        ]);

        console.log("Seed completed successfully!");
        return NextResponse.json({ 
            message: "Test messages created successfully",
            conversations: {
                oneOnOne: updatedOneOnOne,
                group: updatedGroup
            }
        });
    } catch (error: any) {
        console.error("Error seeding messages:", error);
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
} 