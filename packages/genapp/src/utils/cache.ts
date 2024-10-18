export interface Cache<T> {
    content: { [cacheKey: string]: T; };
    resetCacheContent: () => void;
}
