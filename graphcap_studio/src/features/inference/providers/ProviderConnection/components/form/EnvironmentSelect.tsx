import {
	SelectContent,
	SelectItem,
	SelectRoot,
	SelectTrigger,
} from "@/components/ui/select";
import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { Field, createListCollection } from "@chakra-ui/react";
// SPDX-License-Identifier: Apache-2.0
import { Controller } from "react-hook-form";
import { PROVIDER_ENVIRONMENTS } from "../../../../constants";
import { useInferenceProviderContext } from "../../../context";

export function EnvironmentSelect() {
	const { control, errors } = useInferenceProviderContext();
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
						onValueChange={(value) => field.onChange(value)}
						collection={collection}
					>
						<SelectTrigger>{field.value || "Select environment"}</SelectTrigger>
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
