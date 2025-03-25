// SPDX-License-Identifier: Apache-2.0
import { toaster } from "@/components/ui/toaster";

type ToastType = "error" | "success";

export const showToast = (
	text: string,
	type: ToastType,
	options?: Omit<Parameters<typeof toaster.create>[0], "title" | "description">,
) => {
	const title = text;
	if (type === "error") {
		toaster.create({
			title,
			type: "error",
			...options,
		});
	} else {
		toaster.create({
			title,
			type: "success",
			...options,
		});
	}
};

export const errorToast = (
	text: string,
	options?: Omit<Parameters<typeof toaster.create>[0], "title" | "description" | "type">,
) => {
	console.error(text);
	if (text != null && text !== "") {
		toaster.create({
			title: text,
			type: "error",
			...options,
		});
	}
};

export const successToast = (
	text: string,
	options?: Omit<Parameters<typeof toaster.create>[0], "title" | "description" | "type">,
) => {
	if (text != null && text !== "") {
		toaster.create({
			title: text,
			type: "success",
			...options,
		});
	}
};

type MessageType = {
	success: string | ((data: unknown) => string);
	error?: string | ((error: unknown) => string);
};

export async function promiseToast<T>(
	promise: Promise<T>,
	message: MessageType,
	options?: Omit<Parameters<typeof toaster.create>[0], "title" | "description" | "type">,
) {
	// Show loading toast
	const loadingToastId = toaster.create({
		title: "Loading",
		type: "loading",
		...options,
	});

	try {
		const result = await promise;
		// Close loading toast
		toaster.dismiss(loadingToastId);
		// Show success toast
		const successMessage = typeof message.success === 'function' 
			? message.success(result) 
			: message.success;
		toaster.create({
			title: successMessage,
			type: "success",
			...options,
		});
		return result;
	} catch (error) {
		// Close loading toast
		toaster.dismiss(loadingToastId);
		// Show error toast
		const errorMessage = message.error && typeof message.error === 'function'
			? message.error(error)
			: message.error || "Error. Please try again";
		toaster.create({
			title: errorMessage,
			type: "error",
			...options,
		});
		throw error;
	}
}

/**
 * Toast notification utility
 */
export const toast = {
	/**
	 * Show a success toast
	 */
	success: ({ title, description, duration = 3000 }: { title: string; description?: string; duration?: number }) => {
		toaster.create({
			title,
			description,
			duration,
			type: "success",
		});
	},
	
	/**
	 * Show an error toast
	 */
	error: ({ title, description, duration = 5000 }: { title: string; description?: string; duration?: number }) => {
		toaster.create({
			title,
			description,
			duration,
			type: "error",
		});
	},
	
	/**
	 * Show an info toast
	 */
	info: ({ title, description, duration = 3000 }: { title: string; description?: string; duration?: number }) => {
		toaster.create({
			title,
			description,
			duration,
			type: "info",
		});
	},
	
	/**
	 * Show a warning toast
	 */
	warning: ({ title, description, duration = 4000 }: { title: string; description?: string; duration?: number }) => {
		toaster.create({
			title,
			description,
			duration,
			type: "warning",
		});
	}
};
