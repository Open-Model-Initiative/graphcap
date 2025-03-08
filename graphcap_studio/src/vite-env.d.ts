/// <reference types="vite/client" />

// SPDX-License-Identifier: Apache-2.0

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_WORKSPACE_PATH: string;
  readonly VITE_MEDIA_SERVER_URL: string;
  readonly VITE_DATASETS_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
