"use client";

import React from "react";
import { FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";
import { IconType } from "react-icons";
import { BiShow, BiHide } from "react-icons/bi";

interface InputProps<T extends FieldValues> {
	label: string;
	id: Path<T>;
	type?: string;
	required?: boolean;
	register: UseFormRegister<T>;
	errors: FieldErrors<T>;
	disabled?: boolean;
	icon?: IconType;
}

const Input = <T extends FieldValues>({
	label,
	id,
	type = "text",
	register,
	required,
	errors,
	disabled,
	icon: Icon,
}: InputProps<T>): React.JSX.Element => {
	const [showPassword, setShowPassword] = React.useState(false);

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	return (
		<div>
			<label
				htmlFor={id}
				className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
			>
				{label}
			</label>
			<div className="relative mt-2">
				<input
					id={id}
					type={showPassword ? "text" : type}
					autoComplete={type === "password" ? "current-password" : "off"}
					disabled={disabled}
					{...register(id, { required })}
					className={`
						form-input
						block 
						w-full 
						rounded-md 
						border-0 
						py-1.5 
						text-gray-900
						dark:text-white
						dark:bg-gray-700
						shadow-sm 
						ring-1 
						ring-inset 
						ring-gray-300 
						placeholder:text-gray-400 
						focus:ring-2 
						focus:ring-inset 
						focus:ring-sky-600 
						sm:text-sm 
						sm:leading-6
						${errors[id] ? "focus:ring-rose-500" : ""}
						${disabled ? "opacity-50 cursor-default" : ""}
					`}
				/>
				{type === "password" && (
					<button
						type="button"
						onClick={togglePasswordVisibility}
						className="absolute right-3 top-1/2 -translate-y-1/2"
					>
						{showPassword ? (
							<BiHide className="text-gray-500" />
						) : (
							<BiShow className="text-gray-500" />
						)}
					</button>
				)}
				{Icon && (
					<Icon
						size={24}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
					/>
				)}
			</div>
			{errors[id] && (
				<span className="text-sm text-rose-500">
					{errors[id]?.message as string}
				</span>
			)}
		</div>
	);
};

export default Input;
