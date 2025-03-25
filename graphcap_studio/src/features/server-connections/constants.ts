// SPDX-License-Identifier: Apache-2.0

/**
 * Server connection constants
 */
export const SERVER_IDS = {
	MEDIA_SERVER: "media-server",
	INFERENCE_BRIDGE: "inference-bridge",
	DATA_SERVICE: "data-service",
} as const;

export const SERVER_NAMES = {
	[SERVER_IDS.MEDIA_SERVER]: "Media Server",
	[SERVER_IDS.INFERENCE_BRIDGE]: "Inference Bridge",
	[SERVER_IDS.DATA_SERVICE]: "Data Service",
} as const;

export const CONNECTION_STATUS = {
	CONNECTED: "connected",
	DISCONNECTED: "disconnected",
	ERROR: "error",
	TESTING: "testing",
} as const;

export const DEFAULT_URLS = {
	[SERVER_IDS.MEDIA_SERVER]: "http://localhost:32400",
	[SERVER_IDS.INFERENCE_BRIDGE]: "http://localhost:32100",
	[SERVER_IDS.DATA_SERVICE]: "http://localhost:32550",
} as const;
