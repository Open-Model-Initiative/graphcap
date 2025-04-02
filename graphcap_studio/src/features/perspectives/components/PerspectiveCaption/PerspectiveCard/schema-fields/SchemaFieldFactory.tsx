// SPDX-License-Identifier: Apache-2.0
/**
 * Schema Field Factory
 *
 * Factory component for rendering different types of schema fields.
 */

import { isEdge, isNode, isTagArray } from "@/features/clipboard/clipboardFormatters";
import { Stack, Text } from "@chakra-ui/react";
import React from "react";
import { BaseField } from "./BaseField";
import { EdgeField } from "./EdgeField";
import { NodeField } from "./NodeField";
import { TagField } from "./TagField";
import { BaseFieldProps } from "./types";

interface SchemaFieldFactoryProps extends BaseFieldProps {
	// readonly field: SchemaField;
	// readonly value: any;
	// readonly className?: string;
}

export const SchemaFieldFactory: React.FC<SchemaFieldFactoryProps> = ({
	field,
	value,
	className = "",
	hideHeader = false,
}) => {
	// Determine the appropriate component based on field type and value structure
	if (field.is_list) {
		if (isTagArray(value)) {
			return <TagField field={field} value={value} className={className} hideHeader={hideHeader} />;
		}

		if (Array.isArray(value) && value.every(isNode)) {
			return (
				<BaseField field={field} value={value} className={className} hideHeader={hideHeader}>
					<Stack direction="column" gap="2">
						{value.map((node, index) => (
							<NodeField
								key={node.id || index}
								field={{ ...field, is_list: false }}
								value={node}
								hideHeader={hideHeader}
							/>
						))}
					</Stack>
				</BaseField>
			);
		}

		if (Array.isArray(value) && value.every(isEdge)) {
			return (
				<BaseField field={field} value={value} className={className} hideHeader={hideHeader}>
					<Stack direction="column" gap="2">
						{value.map((edge, index) => (
							<EdgeField
								key={`${edge.source}-${edge.target}-${index}`}
								field={{ ...field, is_list: false }}
								value={edge}
								hideHeader={hideHeader}
							/>
						))}
					</Stack>
				</BaseField>
			);
		}
	} else {
		if (isNode(value)) {
			return <NodeField field={field} value={value} className={className} hideHeader={hideHeader} />;
		}

		if (isEdge(value)) {
			return <EdgeField field={field} value={value} className={className} hideHeader={hideHeader} />;
		}
	}

	// Default rendering for other types
	return (
		<BaseField field={field} value={value} className={className} hideHeader={hideHeader}>
			<Text fontSize="sm" color="gray.300" whiteSpace="pre-wrap">
				{typeof value === "object"
					? JSON.stringify(value, null, 2)
					: String(value)}
			</Text>
		</BaseField>
	);
};
