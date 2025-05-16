import { CacheResult } from "@/server/cache/types";

export const apiClient = {
  /**
   * Make a POST request to an API endpoint
   * @param endpoint The API endpoint
   * @param body Request body
   * @param options Additional request options
   * @returns Promise with the typed response
   */
  call: async <ResponseType, Params = Record<string, string | number | boolean | undefined | null>>(
    name: string,
    params?: Params,
    options?: ApiOptions
  ): Promise<CacheResult<ResponseType>> => {
    const response = await fetch('/api/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        params,
        options: {
          ...options,
          disableCache: location.href.includes('localhost') ? true : options?.disableCache
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to call ${name}: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.error) {
      throw new Error(`Failed to call ${name}: ${result.error}`);
    }
    return result;
  }
};

export type ApiOptions = {
  /**
   * Disable caching for this API call - will not save the result to cache
   */
  disableCache?: boolean;
  /**
   * Bypass the cache for this API call - will save the result to cache
   */
  bypassCache?: boolean;
};

export default apiClient;
