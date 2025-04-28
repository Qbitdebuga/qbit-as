export interface ApiClientOptions {
  headers?: Record<string, string>;
  method?: string | null;
  body?: string | null;
}

/**
 * Helper function for making API requests
 * This is used by some clients that don't use the ApiClientBase
 */
export async function apiFetch<T>(url: string, options: ApiClientOptions = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  // For 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return await response.json();
} 