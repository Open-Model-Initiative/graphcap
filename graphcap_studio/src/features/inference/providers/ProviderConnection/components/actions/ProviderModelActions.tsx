// SPDX-License-Identifier: Apache-2.0
import { generateUUID } from "@/utils/rand";
import { Button, Flex, Heading, Input, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useProviderFormContext } from "../../../context/ProviderFormContext";

/**
 * Component for managing provider models, allowing users to add and remove models
 */
export function ProviderModelActions() {
	const { provider, setProvider, watch } = useProviderFormContext();
	const [newModelName, setNewModelName] = useState("");
	const currentModels = watch("models") || [];

	// Handler for adding a new model
	const handleAddModel = () => {
		if (!newModelName.trim() || !provider) return;

		// Create a complete model object with all required properties
		const newModel = {
			id: generateUUID(),
			name: newModelName.trim(),
			isEnabled: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			providerId: provider.id || "",
		};

		// Update the provider with the new model
		setProvider({
			...provider,
			models: [...(provider.models || []), newModel],
		});

		// Clear the input field
		setNewModelName("");
	};

	// Handler for removing a model
	const handleRemoveModel = (modelIndex: number) => {
		if (!provider) return;

		setProvider({
			...provider,
			models: provider.models?.filter((_, index) => index !== modelIndex) || [],
		});
	};

	return (
		<Flex direction="column" gap="4">
			<Flex gap="2">
				<Input
					value={newModelName}
					onChange={(e) => setNewModelName(e.target.value)}
					placeholder="Enter model name"
					flex="1"
				/>
				<Button
					onClick={handleAddModel}
					disabled={!newModelName.trim()}
					size="sm"
				>
					Add Model
				</Button>
			</Flex>

			{/* Show current models */}
			{currentModels.length > 0 && (
				<Flex direction="column" gap="2" mt="4">
					<Heading size="sm">Current Models</Heading>
					{currentModels.map((model, index) => (
						<Flex
							key={`model-${model.name}-${index}`}
							justifyContent="space-between"
							alignItems="center"
							p="2"
							borderWidth="1px"
							borderRadius="md"
						>
							<Text>{model.name}</Text>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleRemoveModel(index)}
							>
								Delete
							</Button>
						</Flex>
					))}
				</Flex>
			)}
		</Flex>
	);
}
