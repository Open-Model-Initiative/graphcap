// SPDX-License-Identifier: Apache-2.0

/**
 * Generates a cryptographically secure random floating-point number
 * between 0 (inclusive) and 1 (exclusive).
 *
 * @returns A secure random number.
 */
export function secureRandom(): number {
	const randomUint32 = new Uint32Array(1);
	window.crypto.getRandomValues(randomUint32);
	// Divide by 2^32 to get a value in [0, 1)
	return randomUint32[0] / (0xffffffff + 1);
}


export function generateUUID() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}


