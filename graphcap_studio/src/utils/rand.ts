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
