/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

import { transporter } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";

const HTML_TEMPLATE = (text: string): string => {
	return `
	  <!DOCTYPE html>
	  <html>
		<head>
		  <meta charset="utf-8">
		  <title>NodeMailer Email Template</title>
		  <style>
			.container {
			  width: 100%;
			  height: 100%;
			  padding: 20px;
			  background-color: #f4f4f4;
			}
			.email {
			  width: 80%;
			  margin: 0 auto;
			  background-color: #fff;
			  padding: 20px;
			}
			.email-header {
			  background-color: #0b9e10;
			  color: #fff;
			  padding: 20px;
			  text-align: center;
			}
			.email-body {
			  padding: 20px;
			}
			.email-footer {
			  background-color: #0b9e10;
			  color: #fff;
			  padding: 20px;
			  text-align: center;
			}
		  </style>
		</head>
		<body>
		  <div class="container">
			<div class="email">
			  <div class="email-header">
				<h1>Video Chat App</h1>
			  </div>
			  <div class="email-body">
				<p>${text}</p>
			  </div>
			  <div class="email-footer">
				<p>You can safely ignore this email if it wasn't you.</p>
			  </div>
			</div>
		  </div>
		</body>
	  </html>
	`;
};

export async function POST(request: Request): Promise<NextResponse> {
	try {
		const body = await request.json();
		const { email, name, password } = body;

		if (!email || !name || !password) {
			return new NextResponse("Missing info", { status: 400 });
		}

		const hashedPassword = await bcrypt.hash(password, 12);

		const user = await prisma.user.create({
			data: {
				email,
				name,
				hashedPassword,
			},
		});

		const emailHtml = `
		<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
			<h1>Video Chat App</h1>
			<p>Hello ${name},</p>
			<p>Thank you for registering with Video Chat App. Your account has been created successfully.</p>
			<p>You can now log in using your email and password.</p>
			<p>Best regards,<br>Video Chat App Team</p>
		</div>
		`;

		return NextResponse.json(user);
	} catch (error: any) {
		console.log(error, "REGISTRATION_ERROR");
		return new NextResponse("Internal Error", { status: 500 });
	}
}
