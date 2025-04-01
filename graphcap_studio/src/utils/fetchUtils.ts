// SPDX-License-Identifier: Apache-2.0
import { secureRandom } from "./rand";

/**
 * Enhanced fetch function with retry logic and timeout handling
 *
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param retryCount - Number of retry attempts (default: 3)
 * @param retryDelay - Base delay between retries in ms (default: 1000)
 * @param timeout - Timeout in ms (default: 30000)
 * @returns Promise with the fetch response
 */
export async function fetchWithRetry(
	url: string | URL,
	options?: RequestInit,
	retryCount = 3,
	retryDelay = 1000,
	timeout = 30000,
): Promise<Response> {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeout);

	try {
		const fetchOptions = {
			...options,
			signal: controller.signal,
		};

		try {
			const response = await fetch(url, fetchOptions);
			if (!response.ok && retryCount > 0) {
				// Exponential backoff with jitter
				const delay =
					retryDelay * 1.5 ** (3 - retryCount) * (0.9 + secureRandom() * 0.2);
				console.warn(
					`Request failed with status ${response.status}. Retrying in ${Math.round(delay)}ms. Attempts left: ${retryCount}`,
				);

				await new Promise((resolve) => setTimeout(resolve, delay));
				return fetchWithRetry(
					url,
					options,
					retryCount - 1,
					retryDelay,
					timeout,
				);
			}
			return response;
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				console.error(`Request timed out after ${timeout}ms:`, url);
				throw new Error(
					`Request timed out after ${timeout}ms: ${url.toString()}`,
				);
			}

			if (retryCount > 0) {
				// Exponential backoff with jitter
				const delay =
					retryDelay * 1.5 ** (3 - retryCount) * (0.9 + secureRandom() * 0.2);
				console.warn(
					`Request failed with error: ${error}. Retrying in ${Math.round(delay)}ms. Attempts left: ${retryCount}`,
				);

				await new Promise((resolve) => setTimeout(resolve, delay));
				return fetchWithRetry(
					url,
					options,
					retryCount - 1,
					retryDelay,
					timeout,
				);
			}
			throw error;
		}
	} finally {
		clearTimeout(id);
	}
} 