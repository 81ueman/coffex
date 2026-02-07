import { hc } from "hono/client";
import type { AppType } from "@coffex/api/app";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8787";

export const apiClient = hc<AppType>(apiBaseUrl);
