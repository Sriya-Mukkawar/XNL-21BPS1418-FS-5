import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Create test users
        const hashedPassword = await bcrypt.hash("password123", 12);
        
        const users = await Promise.all([
            prisma.user.upsert({
                where: { email: "alice@example.com" },
                update: {},
                create: {
                    name: "Alice Johnson",
                    email: "alice@example.com",
                    hashedPassword,
                    emailVerified: true,
                }
            }),
            prisma.user.upsert({
                where: { email: "bob@example.com" },
                update: {},
                create: {
                    name: "Bob Smith",
                    email: "bob@example.com",
                    hashedPassword,
                    emailVerified: true,
                }
            }),
            prisma.user.upsert({
                where: { email: "carol@example.com" },
                update: {},
                create: {
                    name: "Carol White",
                    email: "carol@example.com",
                    hashedPassword,
                    emailVerified: true,
                }
            })
        ]);

        return NextResponse.json({ 
            message: "Test users created successfully",
            users: users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email
            }))
        });
    } catch (error: any) {
        console.error("Error creating test users:", error);
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
} 