import { QueryClient, QueryFunction, QueryClientConfig } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    
    // Try to parse JSON error responses for better error handling
    try {
      const errorData = JSON.parse(text);
      if (errorData.message) {
        // Throw just the message for better UX
        const error = new Error(errorData.message);
        (error as any).status = res.status;
        (error as any).response = { data: errorData };
        throw error;
      }
    } catch (parseError) {
      // Not JSON, fall back to original behavior
    }
    
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest({
  url,
  method = "GET",
  body
}: {
  url: string;
  method?: string;
  body?: any;
}) {
  console.log(`API Request: ${method} ${url}`);
  
  try {
    // Special handling for logout endpoint - don't use JSON or expect any particular response
    if (url === "/api/logout" && method.toUpperCase() === "POST") {
      console.log("Processing logout request directly");
      try {
        const res = await fetch(url, {
          method: "POST",
          credentials: "include",
        });
        
        if (res.ok) {
          console.log("Logout successful");
          // Clear all cached data on logout
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('cache_')) {
              localStorage.removeItem(key);
            }
          });
          return true;
        } else {
          console.error(`Logout failed: ${res.status} ${res.statusText}`);
          throw new Error(`Logout failed: ${res.status} ${res.statusText}`);
        }
      } catch (error) {
        console.error("Logout request failed:", error);
        throw error;
      }
    }
    
    // Regular API requests handling
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    // For successful GET requests, cache the response in localStorage
    if (res.ok && method.toUpperCase() === "GET") {
      try {
        const clonedRes = res.clone();
        const responseData = await clonedRes.json();
        const localStorageKey = `cache_${url.replace(/\//g, '_')}`;
        localStorage.setItem(localStorageKey, JSON.stringify(responseData));
        console.log(`Cached ${method} response for ${url}`);
      } catch (e) {
        console.warn("Could not cache response in localStorage:", e);
      }
    }

    // For unsuccessful requests, provide friendly error messages
    if (!res.ok) {
      if (res.status === 401) {
        console.log("Authentication required for this operation");
      } else {
        console.error(`API error: ${res.status} ${res.statusText} for ${method} ${url}`);
      }
    }

    await throwIfResNotOk(res);
    
    // Parse JSON for all responses that have content
    if (res.headers.get("Content-Length") !== "0" && 
        res.headers.get("Content-Type")?.includes("application/json")) {
      return await res.json();
    }
    
    return res;
  } catch (error) {
    console.error(`Error in apiRequest (${method} ${url}):`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // Log request for debugging
      const endpoint = queryKey[0] as string;
      console.log(`Fetching: ${endpoint}`);
      
      // Check if we have cached data in localStorage for this endpoint
      const localStorageKey = `cache_${endpoint.replace(/\//g, '_')}`;
      const cachedData = localStorage.getItem(localStorageKey);
      
      // Make the API request
      const res = await fetch(endpoint, {
        credentials: "include",
      });

      // Handle 401 Unauthorized based on configuration
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log(`Authentication required for ${endpoint}, but returning fallback data`);
        
        // Special case for /api/user - don't use cached data for authentication
        if (endpoint === "/api/user") {
          console.log("Auth endpoint detected - not using cached data for security");
          return null;
        }
        
        // Return cached data from localStorage for non-auth endpoints if available
        if (cachedData) {
          console.log(`Using cached data for ${endpoint}`);
          try {
            return JSON.parse(cachedData);
          } catch (e) {
            console.error("Error parsing cached data:", e);
          }
        }
        
        return null;
      }

      // For successful responses, cache the data in localStorage
      if (res.ok) {
        const data = await res.json();
        try {
          localStorage.setItem(localStorageKey, JSON.stringify(data));
          console.log(`Cached data for ${endpoint}`);
        } catch (e) {
          console.warn("Could not cache data in localStorage:", e);
        }
        return data;
      }

      // Handle non-ok responses
      await throwIfResNotOk(res);
      return await res.json(); // This line will likely never execute due to throwIfResNotOk
    } catch (error) {
      // For 401 errors when configured to return null, return null instead of throwing
      if (
        unauthorizedBehavior === "returnNull" && 
        error instanceof Error && 
        error.message.includes("401")
      ) {
        console.log("Authentication error caught and handled with null response");
        
        // Special case for /api/user - don't use cached data for authentication endpoint
        const endpoint = queryKey[0] as string;
        if (endpoint === "/api/user") {
          console.log("Auth endpoint detected - not using cached data for security");
          return null;
        }
        
        // Try to get cached data from localStorage for non-auth endpoints
        const localStorageKey = `cache_${endpoint.replace(/\//g, '_')}`;
        const cachedData = localStorage.getItem(localStorageKey);
        
        if (cachedData) {
          try {
            return JSON.parse(cachedData);
          } catch (e) {
            console.error("Error parsing cached data:", e);
          }
        }
        
        return null;
      }
      
      // Log other errors for debugging
      console.error(`Error fetching ${queryKey[0]}:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }), // Change to returnNull to handle auth issues better
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes instead of infinity
      retry: false
    },
    mutations: {
      retry: false
    },
  }
});
