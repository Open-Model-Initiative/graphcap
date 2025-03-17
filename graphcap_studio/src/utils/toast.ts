import { ToastT, toast } from "sonner";

type ToastType = "error" | "success";

export const showToast = (
	text: string,
	type: ToastType,
	options?: Parameters<typeof toast>[1],
) => {
	const toastFn = type === "error" ? toast.error : toast.success;
	toastFn(text, options);
};

export const errorToast = (
	text: string,
	options?: Parameters<typeof toast.error>[1],
) => {
	console.error(text);
	if (text != null && text !== "") {
		toast.error(text, options);
	}
};

export const successToast = (
	text: string,
	options?: Parameters<typeof toast.success>[1],
) => {
	if (text != null && text !== "") {
		toast.success(text, options);
	}
};

type MessageType = {
	success: string | ((data: any) => string);
	error?: string | ((error: any) => string);
};

export async function promiseToast<T>(
	promise: Promise<T>,
	message: MessageType,
	options?: Parameters<typeof toast.promise>[1],
) {
	return toast.promise(promise, {
		loading: "Loading",
		success: message.success,
		error: message.error || "Error. Please try again",
		...options,
	});
}
