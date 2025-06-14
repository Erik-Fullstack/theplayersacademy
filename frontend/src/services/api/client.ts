import { API_BASE_URL } from "@/config/api";

/**
 * Custom error class for API request failures
 * @class ApiError
 * @extends Error
 */
export class ApiError extends Error {
  status: number;
  data: any;

  /**
   * Creates an instance of ApiError
   * @param {string} message - Error message
   * @param {number} status - HTTP status code of the error
   * @param {any} [data] - Additional error data returned from the API
   */
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Base client for making API requests with automatic error handling
 *
 * @template T - The expected return type of the API response
 * @param {string} endpoint - The API endpoint to call (without base URL)
 * @param {RequestOptions} [options] - Request configuration options
 * @param {string} [options.method='GET'] - HTTP method to use
 * @param {any} [options.body] - Request body (will be JSON stringified)
 * @param {Record<string, string>} [options.headers] - Custom headers to include
 * @param {RequestCredentials} [options.credentials] - Credentials mode ('include' by default)
 * @returns {Promise<T>} A promise that resolves to the typed API response
 * @throws {ApiError} When the request fails or returns a non-2xx status code
 */
const apiClient = async <T>(
  endpoint: string,
  options: RequestInit & { body?: unknown } = {},
): Promise<T> => {
  const { body, headers = {}, ...customConfig } = options;

  const config: RequestInit = {
    method: customConfig.method || (body ? "POST" : "GET"),
    ...customConfig,
    headers: {
      ...(!(body instanceof FormData) && {
        "Content-Type": "application/json",
      }),
      ...headers,
    },
    credentials: "include", // Include credentials for auth cookies
  };

  // Handle different body types
  if (body) {
    if (body instanceof FormData) {
      // FormData should be sent as-is
      config.body = body;
    } else if (typeof body === "string") {
      // If body is already a string, use it directly
      config.headers = {
        ...config.headers,
        "Content-Type": "application/json",
      };
      config.body = body;
    } else {
      // For objects, stringify and set appropriate header
      config.headers = {
        ...config.headers,
        "Content-Type": "application/json",
      };
      config.body = JSON.stringify(body);
    }
  }

  try {
    // // Log the request for debugging
    // console.log(`API Request: ${endpoint}`, {
    //   method: config.method,
    //   body: config.body,
    // });

    // Remove the retryFetch and use native fetch directly
    const response = await fetch(
      `${API_BASE_URL}/${endpoint.replace(/^\/*/, "")}`,
      config,
    );

    // // Log response for debugging
    // console.log(`API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: response.statusText,
      }));

      throw new ApiError(
        errorData.message || "An error occurred",
        response.status,
        errorData,
      );
    }

    // For debugging response bodies
    const responseText = await response.text();

    try {
      // Try to parse as JSON
      const json = JSON.parse(responseText);
      // console.log("API Response body:", json);

      return json;
    } catch (e) {
      // If it's not valid JSON, return the text
      // console.log("API Response body (non-JSON):", responseText);

      return responseText as unknown as T;
    }
  } catch (error) {
    console.error("API Request Failed:", error);
    throw error;
  }
};

export default apiClient;
