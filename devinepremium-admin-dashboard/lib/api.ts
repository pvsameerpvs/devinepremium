import {
  ApiRequestError,
  apiRequest as sharedApiRequest,
  resolveApiBaseUrl,
  type ApiRequestOptions,
} from "@devinepremium/shared";

const API_BASE_URL = resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

export { ApiRequestError };

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function apiRequest<T>(
  path: string,
  options: Omit<ApiRequestOptions, "baseUrl"> = {},
) {
  return sharedApiRequest<T>(path, {
    ...options,
    baseUrl: API_BASE_URL,
  });
}
