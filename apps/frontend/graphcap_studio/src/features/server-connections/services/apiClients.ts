// SPDX-License-Identifier: Apache-2.0
/**
 * API Clients Service
 *
 * This module re-exports client functions for interacting with various server APIs.
 */

// Re-export everything from dataServiceClient.ts
export {
	type DataServiceClient,
	getDataServiceUrl, 
	createDataServiceClient,
} from "./dataServiceClient";

// Re-export everything from inferenceBridgeClient.ts
export {
	type InferenceBridgeClient,
	type ProviderClient,
	type PerspectivesClient,
	getInferenceBridgeUrl,
	createInferenceBridgeClient,
	createProviderClient,
	createPerspectivesClient,
} from "./inferenceBridgeClient"; 