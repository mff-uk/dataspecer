import {
  type HttpFetch,
  type FetchOptions,
  type FetchResponse
} from "@dataspecer/core/io/fetch/fetch-api";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";

export interface FetchService {
  /**
   * Execute HTTP request.
   */
  fetch: HttpFetch;
}

/**
 * Custom HTTP service so we have control over resource fetching from a single place.
 */
export const fetchService: FetchService = {
  fetch: (url: string, options?: FetchOptions): Promise<FetchResponse> => {
    return httpFetch(url, options);
  },
};
