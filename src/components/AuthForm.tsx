/* eslint-disable @typescript-eslint/no-unsafe-member-access */

"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import React from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { BsGithub } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { BeatLoader } from "react-spinners";
import { ToastContainer, toast, Theme } from "react-toastify";
import * as Yup from "yup";
import { motion } from "framer-motion";

import { UserSession } from "@/lib/model";
import LoadingAnimation from "./LoadingAnimation";
import AuthSocialButton from "./Inputs/AuthSocialButton";
import Button from "./Inputs/Button";
import Input from "./Inputs/Input";

const ClientToast = React.lazy(() => Promise.resolve({ default: ({ theme }: { theme: Theme }) => {
	if (typeof window !== 'undefined') {
		require('react-toastify/dist/ReactToastify.css');
	}
	return <ToastContainer position="top-center" theme={theme} />;
}}));

enum FormVariants {
	LOGIN = "LOGIN",
	REGISTER = "REGISTER",
}

interface FormData {
	name?: string;
	email: string;
	password: string;
}

const loginSchema = Yup.object({
	email: Yup.string().email('Invalid email').required('Email is required'),
	password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
}).required();

const registerSchema = loginSchema.shape({
	name: Yup.string().required('Name is required'),
}).required();

export default function AuthForm(): React.JSX.Element {
	const router = useRouter();
	const { data: session } = useSession() as { data: UserSession | undefined };
	const { systemTheme, theme } = useTheme();
	const currentTheme = theme === "system" ? systemTheme : theme;
	const [variant, setVariant] = React.useState<FormVariants>(FormVariants.LOGIN);
	const [loading, setLoading] = React.useState<boolean>(false);

	const toggleVariant = React.useCallback(() => {
		setVariant(variant === FormVariants.LOGIN ? FormVariants.REGISTER : FormVariants.LOGIN);
	}, [variant]);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<FormData>({
		resolver: yupResolver(variant === FormVariants.LOGIN ? loginSchema : registerSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
	});

	React.useEffect(() => {
		reset();
	}, [variant, reset]);

	const onSubmit: SubmitHandler<FormData> = async (data) => {
		setLoading(true);

		try {
			if (variant === FormVariants.REGISTER) {
				// Register
				await axios.post('/api/register', data);
				// Auto login after registration
				await signIn('credentials', {
					email: data.email,
					password: data.password,
					redirect: false,
				});
			} else {
				// Login
				const result = await signIn('credentials', {
					email: data.email,
					password: data.password,
					redirect: false,
				});

				if (result?.error) {
					toast.error('Invalid credentials');
					return;
				}
			}

			router.push('/chat');
		} catch (error) {
			toast.error('Something went wrong!');
		} finally {
			setLoading(false);
		}
	};

	const socialAction = async (action: string) => {
		setLoading(true);
		try {
			const result = await signIn(action, { redirect: false });
			if (result?.error) {
				toast.error('Invalid credentials');
			}
			if (result?.ok) {
				router.push('/chat');
			}
		} catch (error) {
			toast.error('Something went wrong!');
		} finally {
			setLoading(false);
		}
	};

	React.useEffect(() => {
		if (session?.user) {
			router.push('/chat');
		}
	}, [session, router]);

	if (session?.user) {
		return <LoadingAnimation />;
	}

	return (
		<>
			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800"
				>
					<form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
						{variant === FormVariants.REGISTER && (
							<Input<FormData>
								id="name"
								label="Name"
								register={register}
								errors={errors}
								disabled={loading}
							/>
						)}
						<Input<FormData>
							id="email"
							label="Email"
							type="email"
							register={register}
							errors={errors}
							disabled={loading}
						/>
						<Input<FormData>
							id="password"
							label="Password"
							type="password"
							register={register}
							errors={errors}
							disabled={loading}
						/>
						<Button disabled={loading} fullWidth type="submit">
							{loading ? (
								<BeatLoader size={8} color="#fff" />
							) : variant === FormVariants.LOGIN ? (
								"Sign in"
							) : (
								"Register"
							)}
						</Button>
					</form>

					<div className="mt-6">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-300" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="bg-white px-2 text-gray-500 dark:bg-gray-800">
									Or continue with
								</span>
							</div>
						</div>

						<div className="mt-6 flex gap-2">
							<AuthSocialButton
								icon={BsGithub}
								onClick={() => socialAction("github")}
							/>
							<AuthSocialButton
								icon={FcGoogle}
								onClick={() => socialAction("google")}
							/>
						</div>
					</div>

					<div className="mt-6 flex justify-center gap-2 px-2 text-sm text-gray-500">
						<div>
							{variant === FormVariants.LOGIN
								? "New to Messenger?"
								: "Already have an account?"}
						</div>
						<div onClick={toggleVariant} className="cursor-pointer underline">
							{variant === FormVariants.LOGIN ? "Create an account" : "Login"}
						</div>
					</div>
				</motion.div>
			</div>
			<React.Suspense fallback={null}>
				<ClientToast theme={currentTheme as Theme} />
			</React.Suspense>
		</>
	);
}
