// SPDX-License-Identifier: Apache-2.0
/**
 * Schema Field Factory
 *
 * Factory component for rendering different types of schema fields.
 */

import { SchemaField } from "@/features/perspectives/types";
import { Stack, Text } from "@chakra-ui/react";
import React from "react";
import { BaseField } from "./BaseField";
import { EdgeField } from "./EdgeField";
import { NodeField } from "./NodeField";
import { TagField } from "./TagField";
import { isEdge, isNode, isTagArray } from "./formatters";

interface SchemaFieldFactoryProps {
	readonly field: SchemaField;
	readonly value: any;
	readonly className?: string;
}

export const SchemaFieldFactory: React.FC<SchemaFieldFactoryProps> = ({
	field,
	value,
	className = "",
}) => {
	// Determine the appropriate component based on field type and value structure
	if (field.is_list) {
		if (isTagArray(value)) {
			return <TagField field={field} value={value} className={className} />;
		}

		if (Array.isArray(value) && value.every(isNode)) {
			return (
				<BaseField field={field} value={value} className={className}>
					<Stack direction="column" gap="2">
						{value.map((node, index) => (
							<NodeField
								key={node.id || index}
								field={{ ...field, is_list: false }}
								value={node}
							/>
						))}
					</Stack>
				</BaseField>
			);
		}

		if (Array.isArray(value) && value.every(isEdge)) {
			return (
				<BaseField field={field} value={value} className={className}>
					<Stack direction="column" gap="2">
						{value.map((edge, index) => (
							<EdgeField
								key={`${edge.source}-${edge.target}-${index}`}
								field={{ ...field, is_list: false }}
								value={edge}
							/>
						))}
					</Stack>
				</BaseField>
			);
		}
	} else {
		if (isNode(value)) {
			return <NodeField field={field} value={value} className={className} />;
		}

		if (isEdge(value)) {
			return <EdgeField field={field} value={value} className={className} />;
		}
	}

	// Default rendering for other types
	return (
		<BaseField field={field} value={value} className={className}>
			<Text fontSize="sm" color="gray.300" whiteSpace="pre-wrap">
				{typeof value === "object"
					? JSON.stringify(value, null, 2)
					: String(value)}
			</Text>
		</BaseField>
	);
};
