export interface ApiRequestOptions extends RequestInit {
  token?: string;
  baseUrl?: string;
  fallbackBaseUrl?: string;
}

export declare function resolveApiBaseUrl(
  value?: string,
  fallbackBaseUrl?: string,
): string;

export declare function apiRequest<T>(
  path: string,
  options?: ApiRequestOptions,
): Promise<T>;
