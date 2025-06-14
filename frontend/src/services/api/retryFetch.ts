export async function retryFetch(
  url: string,
  options: RequestInit,
  { retries = 3, retryDelay = 1000 } = {},
) {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      lastError = error;
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  throw lastError;
}
