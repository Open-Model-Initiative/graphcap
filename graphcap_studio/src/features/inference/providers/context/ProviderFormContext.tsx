// SPDX-License-Identifier: Apache-2.0
import { type ReactNode, createContext, useContext } from "react";
import type { Control, FieldErrors, UseFormWatch } from "react-hook-form";
import type { ConnectionDetails, ErrorDetails, Provider, ProviderCreate, ProviderUpdate } from "../types";

interface ProviderFormContextType {
	mode: "view" | "edit" | "create";
	isSubmitting: boolean;
	isCreating: boolean;
	saveSuccess: boolean;
	isTestingConnection: boolean;
	selectedProvider: Provider | null;
	setSelectedProvider: (provider: Provider | null) => void;
	formError: ErrorDetails | null;
	connectionError: ErrorDetails | null;
	connectionDetails: ConnectionDetails | null;
	dialogs: {
		error: boolean;
		success: boolean;
		formError: boolean;
		save: boolean;
	};
	saveError?: string;
	savedProvider: Provider | null;
	providers: Provider[];
	
	// Form handling properties
	control: Control<ProviderCreate | ProviderUpdate>;
	errors: FieldErrors<ProviderCreate | ProviderUpdate>;
	watch: UseFormWatch<ProviderCreate | ProviderUpdate>;
	
	// Model selection properties
	providerModelsData: { models: Array<{ id: string; name: string; is_default?: boolean }> } | null;
	isLoadingModels: boolean;
	isModelsError: boolean;
	modelsError: Error | null;
	selectedModelId: string | null;
	setSelectedModelId: (id: string | null) => void;
	handleModelSelect: () => void;
	
	onSubmit: (data: ProviderCreate | ProviderUpdate) => Promise<void>;
	onCancel: () => void;
	handleSubmit: (
		handler: (data: ProviderCreate | ProviderUpdate) => Promise<void>,
	) => (e: React.FormEvent) => void;
	handleTestConnection: () => Promise<void>;
	setMode: (mode: "view" | "edit" | "create") => void;
	closeDialog: (dialog: "error" | "success" | "formError" | "save") => void;
	openSaveDialog: () => void;
}

const ProviderFormContext = createContext<ProviderFormContextType | undefined>(
	undefined,
);

export function useProviderFormContext() {
	const context = useContext(ProviderFormContext);
	if (context === undefined) {
		throw new Error(
			"useProviderFormContext must be used within a ProviderFormProvider",
		);
	}
	return context;
}

interface ProviderFormProviderProps {
	children: ReactNode;
	value: ProviderFormContextType;
}

export function ProviderFormProvider({
	children,
	value,
}: ProviderFormProviderProps) {
	return (
		<ProviderFormContext.Provider value={value}>
			{children}
		</ProviderFormContext.Provider>
	);
}
