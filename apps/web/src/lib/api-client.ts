import type { AppType } from "@coffex/api/app";
import { hc } from "hono/client";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8787";

export const apiClient = hc<AppType>(apiBaseUrl);
