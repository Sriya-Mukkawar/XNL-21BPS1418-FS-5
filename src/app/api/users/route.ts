/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const users = await prisma.user.findMany({
			orderBy: {
				createdAt: "desc",
			},
			select: {
				id: true,
				name: true,
				image: true,
			},
		});

		return NextResponse.json(users);
	} catch (error) {
		console.error("Error fetching users:", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
