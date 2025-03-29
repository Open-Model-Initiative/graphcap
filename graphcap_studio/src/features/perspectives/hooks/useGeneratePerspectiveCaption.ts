// SPDX-License-Identifier: Apache-2.0
/**
 * useGeneratePerspectiveCaption Hook
 *
 * This hook provides functionality to generate captions for images using perspectives.
 */

import { useServerConnectionsContext } from "@/context";
import { SERVER_IDS } from "@/features/server-connections/constants";
import { createInferenceBridgeClient } from "@/features/server-connections/services/apiClients";
import type { CaptionOptions, CaptionResponse } from "@/types";
import {
	type Provider,
	toServerConfig,
} from "@/types/provider-config-types";
import type { ServerConnection } from "@/types/server-connection-types";
import { toast } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { perspectivesQueryKeys } from "../services/constants";
import { ensureWorkspacePath, handleApiError } from "../services/utils";

/**
 * Hook to generate a perspective caption for an image
 *
 * @returns A mutation for generating captions
 */
export function useGeneratePerspectiveCaption() {
	const queryClient = useQueryClient();
	const { connections } = useServerConnectionsContext();

	return useMutation<
		CaptionResponse,
		Error,
		{
			perspective: string;
			imagePath: string;
			provider: Provider; // Use Provider type from types.ts
			options?: CaptionOptions;
		}
	>({
		mutationFn: async ({ perspective, imagePath, provider, options }) => {
			const graphcapServerConnection = connections.find(
				(conn: ServerConnection) => conn.id === SERVER_IDS.INFERENCE_BRIDGE,
			);
			const isConnected = graphcapServerConnection?.status === "connected";

			if (!isConnected) {
				throw new Error("Server connection not established");
			}

			if (!options) {
				throw new Error("Caption generation options are required");
			}

			// Check if a model is specified in the options
			if (!options.model) {
				throw new Error("A model must be specified in the options");
			}

			// Use the inference bridge client instead of direct fetch
			const client = createInferenceBridgeClient(connections);

			// Normalize the image path to ensure it starts with /workspace
			const normalizedImagePath = ensureWorkspacePath(imagePath);

			// Convert provider to server config
			const providerConfig = toServerConfig(provider);

			console.log(
				`Generating caption for image: ${normalizedImagePath} using perspective: ${perspective}`,
			);

			// Prepare the request body according to the server's expected format
			const requestBody = {
				perspective,
				image_path: normalizedImagePath,
				provider: provider.name,
				model: options.model, // Use the model from options
				provider_config: providerConfig, // Include the full provider configuration
				max_tokens: options.max_tokens,
				temperature: options.temperature,
				top_p: options.top_p,
				repetition_penalty: options.repetition_penalty,
				context: options.context || [],
				global_context: options.global_context ?? "",
				resize: options.resize ?? false,
				resize_resolution: options.resize_resolution ?? "HD_720P",
			};

			console.log("Sending caption generation request using API client", {
				perspective,
				image_path: normalizedImagePath,
				provider: provider.name,
				model: options.model, // Log the model from options
				options: {
					max_tokens: requestBody.max_tokens,
					temperature: requestBody.temperature,
					top_p: requestBody.top_p,
					repetition_penalty: requestBody.repetition_penalty,
					context: requestBody.context,
					global_context: requestBody.global_context,
					resize: requestBody.resize,
					resize_resolution: requestBody.resize_resolution,
				},
			});

			const response = await client.perspectives["caption-from-path"].$post({
				json: requestBody,
			});

			if (!response.ok) {
				await handleApiError(response, "Failed to generate caption");
			}

			const data = (await response.json()) as CaptionResponse;

			console.log(
				`Successfully generated caption for perspective: ${perspective}`,
				{
					content: data.result || data.content,
				},
			);

			// Return data with the provided options
			return {
				...data,
				// Include the original options that were used
				options: options,
			};
		},
		onSuccess: (_result, variables) => {
			console.debug("Caption generation successful, invalidating queries", {
				imagePath: variables.imagePath,
				perspective: variables.perspective,
			});

			// Invalidate the specific caption query
			queryClient.invalidateQueries({
				queryKey: perspectivesQueryKeys.caption(
					variables.imagePath,
					variables.perspective,
				),
			});
		},
		onError: (error) => {
			console.error("Caption generation failed", error);
			toast.error({
				title: "Caption generation failed",
				description: error.message,
			});
		},
	});
}
