export * from "@tanstack/react-query";
export * from "@tanstack/react-query-devtools";

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos (antes chamado cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
