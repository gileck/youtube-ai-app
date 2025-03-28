/**
 * Client-side API utilities for making fetch requests with TypeScript support
 * This file should ONLY be imported from client-side code
 */

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  baseUrl?: string;
  timeout?: number;
};

/**
 * Generic function to make API requests and handle responses with proper typing
 * @param url The API endpoint URL (relative to baseUrl)
 * @param params The request parameters/body
 * @param options Additional request options
 * @returns Promise with the typed response
 */
export const fetchJSON = async <ResponseType, ParamsType = unknown>(
  url: string,
  params?: ParamsType,
  options: ApiOptions = {}
): Promise<ResponseType> => {
  const {
    method = params ? 'POST' : 'GET',
    headers = {},
    baseUrl = '',
    timeout = 30000,
  } = options;

  // Create the request URL
  const requestUrl = `${baseUrl}${url}`;

  // Set up headers with default content type
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Create request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // Add body for non-GET requests if params exist
  if (params && method !== 'GET') {
    requestOptions.body = JSON.stringify(params);
  }

  // Add params to URL for GET requests
  let finalUrl = requestUrl;
  if (params && method === 'GET') {
    const queryParams = new URLSearchParams();
    Object.entries(params as Record<string, string | number | boolean | undefined | null>).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    const queryString = queryParams.toString();
    finalUrl = queryString ? `${requestUrl}?${queryString}` : requestUrl;
  }

  try {
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout);
    });

    // Create the fetch promise
    const fetchPromise = fetch(finalUrl, requestOptions);

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Parse the JSON response
    const data = await response.json();

    // Check if the response contains an error field (following our API convention)
    if (data.error) {
      throw new Error(data.error);
    }

    return data as ResponseType;
  } catch (error) {
    console.error('API request failed:', error);
    throw error instanceof Error 
      ? error 
      : new Error(`API request failed: ${String(error)}`);
  }
};

/**
 * Simplified function to make API requests with a single params object
 * @param params The request parameters including URL and body
 * @returns Promise with the typed response
 */
export const apiClient = {
  /**
   * Make a GET request to an API endpoint
   * @param endpoint The API endpoint
   * @param queryParams Optional query parameters
   * @param options Additional request options
   * @returns Promise with the typed response
   */
  get: <ResponseType, QueryParamsType = Record<string, string | number | boolean | undefined | null>>(
    endpoint: string,
    queryParams?: QueryParamsType,
    options?: ApiOptions
  ): Promise<ResponseType> => {
    return fetchJSON<ResponseType, QueryParamsType>(
      endpoint,
      queryParams,
      { ...options, method: 'GET' }
    );
  },

  /**
   * Make a POST request to an API endpoint
   * @param endpoint The API endpoint
   * @param body Request body
   * @param options Additional request options
   * @returns Promise with the typed response
   */
  post: <ResponseType, BodyType = Record<string, string | number | boolean | undefined | null>>(
    endpoint: string,
    body?: BodyType,
    options?: ApiOptions
  ): Promise<ResponseType> => {
    return fetchJSON<ResponseType, BodyType>(
      endpoint,
      body,
      { ...options, method: 'POST' }
    );
  }
};

export default apiClient;
