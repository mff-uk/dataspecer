import { QueryClient } from "react-query";

export const queryClient = new QueryClient({
    // defaultOptions: {
    //   queries: {
    //     staleTime: 10 * (60 * 1000), // 10 mins
    //     cacheTime: 10 * (60 * 1000),
    //   },
    // },
  });