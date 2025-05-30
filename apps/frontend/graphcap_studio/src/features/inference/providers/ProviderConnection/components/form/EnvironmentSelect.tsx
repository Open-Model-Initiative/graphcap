import {
	SelectContent,
	SelectItem,
	SelectRoot,
	SelectTrigger,
	SelectValueText,
} from "@/components/ui/select";
import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { Field, createListCollection } from "@chakra-ui/react";
// SPDX-License-Identifier: Apache-2.0
import { Controller } from "react-hook-form";
import { PROVIDER_ENVIRONMENTS } from "../../../../constants";
import { useProviderFormContext } from "../../../context/ProviderFormContext";

export function EnvironmentSelect() {
	const { control, errors } = useProviderFormContext();
	const labelColor = useColorModeValue("gray.600", "gray.300");

	const environmentItems = PROVIDER_ENVIRONMENTS.map((env) => ({
		label: env,
		value: env,
	}));

	const collection = createListCollection({
		items: environmentItems,
	});

	return (
		<Controller
			name="environment"
			control={control}
			render={({ field }) => (
				<Field.Root invalid={!!errors.environment}>
					<Field.Label color={labelColor}>Environment</Field.Label>
					<SelectRoot
						{...field}
						value={field.value ? [field.value] : []}
						onValueChange={(details) => {
							if (details.value && details.value.length > 0) {
								field.onChange(details.value[0]);
							} else {
								field.onChange("");
							}
						}}
						collection={collection}
					>
						<SelectTrigger>
							<SelectValueText placeholder="Select environment" />
						</SelectTrigger>
						<SelectContent>
							{environmentItems.map((item) => (
								<SelectItem key={item.value} item={item}>
									{item.label}
								</SelectItem>
							))}
						</SelectContent>
					</SelectRoot>
					<Field.ErrorText>{errors.environment?.message}</Field.ErrorText>
				</Field.Root>
			)}
		/>
	);
}
