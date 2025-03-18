// SPDX-License-Identifier: Apache-2.0
import type { IconButtonProps } from "@chakra-ui/react";
import { IconButton } from "@chakra-ui/react";
import * as React from "react";
import { LuTrash2 } from "react-icons/lu";

export type DeleteButtonProps = IconButtonProps;

/**
 * DeleteButton component for consistent delete actions
 */
export const DeleteButton = React.forwardRef<
	HTMLButtonElement,
	DeleteButtonProps
>(function DeleteButton(props, ref) {
	return (
		<IconButton
			variant="ghost"
			size="sm"
			aria-label="Delete"
			colorPalette="gray"
			_hover={{ color: "red.500" }}
			ref={ref}
			{...props}
		>
			{props.children ?? <LuTrash2 />}
		</IconButton>
	);
});
