/// <reference types="vite/client" />

// SPDX-License-Identifier: Apache-2.0

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_WORKSPACE_PATH: string;
  readonly VITE_MEDIA_SERVER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
