// SPDX-License-Identifier: Apache-2.0
/**
 * SchemaView Component
 *
 * This component displays the schema information for a perspective.
 */

import React from "react";
import type { PerspectiveSchema } from "../../../types";
import { SchemaFieldFactory } from "./schema-fields";

interface SchemaViewProps {
	schema: PerspectiveSchema;
	className?: string;
}

export function SchemaView({ schema, className = "" }: SchemaViewProps) {
	return (
		<div className={`space-y-4 ${className}`}>
			{schema.schema_fields.map((field) => (
				<div key={field.name} className="bg-gray-800 p-3 rounded-lg">
					<SchemaFieldFactory field={field} value={null} />
				</div>
			))}
		</div>
	);
}
