import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CachingService } from '../../../src/services/caching';
import { BshClient } from '../../../src/client/bsh-client';
import { CacheInfo, BshSearch } from '../../../src/types';

describe('CachingService', () => {
    let cachingService: CachingService;
    let mockClient: BshClient;
    let mockGet: ReturnType<typeof vi.fn>;
    let mockPost: ReturnType<typeof vi.fn>;
    let mockDelete: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockGet = vi.fn();
        mockPost = vi.fn();
        mockDelete = vi.fn();
        mockClient = {
            get: mockGet,
            post: mockPost,
            put: vi.fn(),
            delete: mockDelete,
            patch: vi.fn(),
            download: vi.fn(),
        } as unknown as BshClient;
        cachingService = new CachingService(mockClient);
    });

    describe('findById', () => {
        it('should call client.get with correct parameters', async () => {
            const mockCacheInfo: CacheInfo = {
                name: 'test-cache',
                estimatedSize: 0,
                requestCount: 0,
                hitCount: 0,
                hitRate: 0,
                missCount: 0,
                missRate: 0,
                expireAfterWrite: null,
                expireAfterAccess: null,
                maximumSize: 1000,
                currentSize: 0,
                evictionCount: 0,
                evictionWeight: 0,
                loadCount: 0,
                totalLoadTime: 0,
                averageLoadPenalty: 0,
                loadSuccessCount: 0,
                loadFailureCount: 0,
                loadFailureRate: 0
            };
            const mockResponse = {
                data: [mockCacheInfo],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockGet.mockResolvedValue(mockResponse);

            const params = {
                id: 'cache1',
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await cachingService.findById(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/caching/cache1',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'caching.findById',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('search', () => {
        it('should call client.post with correct parameters', async () => {
            const mockCacheInfo: CacheInfo = {
                name: 'test-cache',
                estimatedSize: 0,
                requestCount: 0,
                hitCount: 0,
                hitRate: 0,
                missCount: 0,
                missRate: 0,
                expireAfterWrite: null,
                expireAfterAccess: null,
                maximumSize: 1000,
                currentSize: 0,
                evictionCount: 0,
                evictionWeight: 0,
                loadCount: 0,
                totalLoadTime: 0,
                averageLoadPenalty: 0,
                loadSuccessCount: 0,
                loadFailureCount: 0,
                loadFailureRate: 0
            };
            const mockResponse = {
                data: [mockCacheInfo],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const searchParams: BshSearch = {
                filters: [],
                sort: [],
                pagination: { page: 1, size: 10 }
            };
            const params = {
                payload: searchParams,
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await cachingService.search(params);

            expect(mockPost).toHaveBeenCalledWith({
                path: '/api/caching/search',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: searchParams,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'caching.search',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('names', () => {
        it('should call client.get with correct parameters', async () => {
            const mockResponse = {
                data: ['cache1', 'cache2', 'cache3'],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockGet.mockResolvedValue(mockResponse);

            const params = {
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await cachingService.names(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/caching/names',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'caching.names',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('clearById', () => {
        it('should call client.delete with correct parameters', async () => {
            const mockResponse = {
                data: [{ caches: ['cache1'] }],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockDelete.mockResolvedValue(mockResponse);

            const params = {
                id: 'cache1',
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await cachingService.clearById(params);

            expect(mockDelete).toHaveBeenCalledWith({
                path: '/api/caching/cache1',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'caching.clearById',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('clearAll', () => {
        it('should call client.delete with correct parameters', async () => {
            const mockResponse = {
                data: [{ caches: ['cache1', 'cache2'] }],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockDelete.mockResolvedValue(mockResponse);

            const params = {
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await cachingService.clearAll(params);

            expect(mockDelete).toHaveBeenCalledWith({
                path: '/api/caching/all',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'caching.clearAll',
            });
            expect(result).toEqual(mockResponse);
        });
    });
});

