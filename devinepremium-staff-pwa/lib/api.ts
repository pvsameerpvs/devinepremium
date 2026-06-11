import {
  ApiRequestError,
  apiRequest as sharedApiRequest,
  resolveApiBaseUrl,
  type ApiRequestOptions,
} from "@devinepremium/shared";
import { clearStaffSession } from "./auth";

const API_BASE_URL = resolveApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000",
);

export { ApiRequestError };

export async function apiRequest<T>(
  path: string,
  options: Omit<ApiRequestOptions, "baseUrl"> = {},
) {
  try {
    return await sharedApiRequest<T>(path, {
      ...options,
      baseUrl: API_BASE_URL,
    });
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 401) {
      if (typeof window !== "undefined") {
        clearStaffSession();
        window.location.href = "/login";
      }
    }
    throw err;
  }
}
