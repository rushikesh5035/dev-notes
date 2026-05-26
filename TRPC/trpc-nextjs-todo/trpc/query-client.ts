import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // How long data remains fresh before refetching. it's set to 30 seconds.
      },
    },
  });
}
