// SPDX-License-Identifier: Apache-2.0
/**
 * API Clients Service
 *
 * This module re-exports client functions for interacting with various server APIs.
 */

// Re-export everything from dataServiceClient.ts
export {
	createDataServiceClient, getDataServiceBaseUrl, type DataServiceClient
} from "./dataServiceClient";

// Re-export everything from inferenceBridgeClient.ts
export {
	createInferenceBridgeClient, createPerspectivesClient, createProviderClient, getInferenceBridgeUrl, type InferenceBridgeClient, type PerspectivesClient, type ProviderClient
} from "./inferenceBridgeClient";
