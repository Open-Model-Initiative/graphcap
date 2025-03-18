// SPDX-License-Identifier: Apache-2.0
import type { IconButtonProps } from "@chakra-ui/react";
import { IconButton } from "@chakra-ui/react";
import * as React from "react";
import { LuPlus } from "react-icons/lu";

export type AddButtonProps = IconButtonProps;

/**
 * AddButton component for consistent add/create actions
 */
export const AddButton = React.forwardRef<HTMLButtonElement, AddButtonProps>(
	function AddButton(props, ref) {
		return (
			<IconButton
				variant="ghost"
				size="sm"
				aria-label="Add item"
				colorPalette="gray"
				ref={ref}
				{...props}
			>
				{props.children ?? <LuPlus />}
			</IconButton>
		);
	},
);
