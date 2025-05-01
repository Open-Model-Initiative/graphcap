import { hc } from "hono/client";
import type { AppType } from "../../../servers/data_service/src/app";

// Base URL is root because paths in AppType already include `/api`
export const apiClient = hc<AppType>("");

export type ApiClient = typeof apiClient;
