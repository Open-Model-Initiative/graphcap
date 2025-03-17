// SPDX-License-Identifier: Apache-2.0
import type { IconButtonProps } from "@chakra-ui/react";
import { IconButton } from "@chakra-ui/react";
import * as React from "react";
import { LuPencil } from "react-icons/lu";

export type EditButtonProps = IconButtonProps;

/**
 * EditButton component for consistent editing actions
 */
export const EditButton = React.forwardRef<HTMLButtonElement, EditButtonProps>(
	function EditButton(props, ref) {
		return (
			<IconButton
				variant="ghost"
				size="sm"
				aria-label="Edit"
				colorPalette="gray"
				ref={ref}
				{...props}
			>
				{props.children ?? <LuPencil />}
			</IconButton>
		);
	},
);
