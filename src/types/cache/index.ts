export type CacheInfo = {
    name: string;
    estimatedSize: number;
    requestCount: number;
    hitCount: number;
    hitRate: number;
    missCount: number;
    missRate: number;
    expireAfterWrite: number | null;
    expireAfterAccess: number | null;
    maximumSize: number;
    currentSize: number;
    evictionCount: number;
    evictionWeight: number;
    loadCount: number;
    totalLoadTime: number;
    averageLoadPenalty: number;
    loadSuccessCount: number;
    loadFailureCount: number;
    loadFailureRate: number;
};

