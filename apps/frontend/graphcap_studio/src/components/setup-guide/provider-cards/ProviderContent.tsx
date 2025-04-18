// SPDX-License-Identifier: Apache-2.0
import type { ProviderType } from "../../setup-guide";
import { 
  GoogleSetup, 
  OpenAISetup, 
  VllmSetup, 
  OllamaSetup 
} from "./provider-setups";

interface ProviderContentProps {
  readonly provider: ProviderType;
}

export function ProviderContent({ provider }: ProviderContentProps) {
  switch (provider) {
    case "google":
      return <GoogleSetup />;
    case "openai":
      return <OpenAISetup />;
    case "vllm":
      return <VllmSetup />;
    case "ollama":
      return <OllamaSetup />;
    default:
      return null;
  }
} 