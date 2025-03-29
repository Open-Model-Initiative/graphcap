// SPDX-License-Identifier: Apache-2.0
import type { ConnectionDetails, ErrorDetails, Provider, ProviderCreate, ProviderUpdate } from "@/types/provider-config-types";
import { type ReactNode, createContext, useContext } from "react";
import type { Control, FieldErrors, UseFormWatch } from "react-hook-form";

// Simplified dialog state type
type DialogType = null | "error" | "success" | "formError" | "save";

interface ProviderFormContextType {
	// Core state
	provider: Provider | null;
	mode: "view" | "edit" | "create";
	
	// Form state
	control: Control<ProviderCreate | ProviderUpdate>;
	errors: FieldErrors<ProviderCreate | ProviderUpdate>;
	watch: UseFormWatch<ProviderCreate | ProviderUpdate>;
	
	// UI state
	isSubmitting: boolean;
	dialog: DialogType;
	error: ErrorDetails | null;
	connectionDetails: ConnectionDetails | null;
	
	// Selected model state
	selectedModelId: string | null;
	providerModels: Array<{ id: string; name: string; is_default?: boolean }> | null;
	isLoadingModels: boolean;
	
	// Actions
	setProvider: (provider: Provider | null) => void;
	setMode: (mode: "view" | "edit" | "create") => void;
	setSelectedModelId: (id: string | null) => void;
	openDialog: (type: DialogType, error?: ErrorDetails) => void;
	closeDialog: () => void;
	
	// Form actions
	handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
	cancelEdit: () => void;
	testConnection: () => Promise<void>;
}

const ProviderFormContext = createContext<ProviderFormContextType | undefined>(undefined);

export function useProviderFormContext() {
	const context = useContext(ProviderFormContext);
	if (context === undefined) {
		throw new Error("useProviderFormContext must be used within a ProviderFormProvider");
	}
	return context;
}

interface ProviderFormProviderProps {
	children: ReactNode;
	value: ProviderFormContextType;
}

export function ProviderFormProvider({ children, value }: ProviderFormProviderProps) {
	return (
		<ProviderFormContext.Provider value={value}>
			{children}
		</ProviderFormContext.Provider>
	);
}
