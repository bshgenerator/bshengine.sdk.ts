import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CachingService } from '@src/services/caching';
import { bshConfigs } from '@config';
import type { BshClientFn, BshAuthFn } from '@src/client/types';
import type { CacheInfo, BshSearch } from '@types';
import { BshError } from '@types';

describe('CachingService', () => {
  let mockClientFn: BshClientFn;
  let mockAuthFn: BshAuthFn;
  let mockGet: any;
  let mockPost: any;
  let mockDelete: any;

  beforeEach(() => {
    // Reset singleton
    (CachingService as any).instance = undefined;
    bshConfigs.reset();

    // Setup mocks
    mockGet = vi.fn();
    mockPost = vi.fn();
    mockDelete = vi.fn();

    mockClientFn = vi.fn();
    mockAuthFn = vi.fn().mockResolvedValue({ type: 'JWT', token: 'test-token' });

    // Mock BshClient methods
    const mockClient = {
      get: mockGet,
      post: mockPost,
      delete: mockDelete,
    };

    // Mock createClient to return our mock
    vi.spyOn(bshConfigs, 'createClient').mockReturnValue(mockClient as any);

    bshConfigs.configure({
      clientFn: mockClientFn,
      authFn: mockAuthFn,
      host: 'http://localhost:3000',
    });
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = CachingService.getInstance();
      const instance2 = CachingService.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should create a new instance after reset', () => {
      const instance1 = CachingService.getInstance();
      (CachingService as any).instance = undefined;
      const instance2 = CachingService.getInstance();

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('findById', () => {
    it('should call client.get with correct endpoint', async () => {
      const cacheId = 'cache-123';
      const mockCacheInfo: CacheInfo = {
        name: 'test-cache',
        estimatedSize: 1024,
        requestCount: 100,
        hitCount: 80,
        hitRate: 0.8,
        missCount: 20,
        missRate: 0.2,
        expireAfterWrite: 3600,
        expireAfterAccess: 1800,
        maximumSize: 10000,
        currentSize: 5000,
        evictionCount: 10,
        evictionWeight: 5,
        loadCount: 20,
        totalLoadTime: 1000,
        averageLoadPenalty: 50,
        loadSuccessCount: 18,
        loadFailureCount: 2,
        loadFailureRate: 0.1,
      };
      const mockResponse = {
        data: [mockCacheInfo],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockGet.mockResolvedValue(mockResponse);

      const cachingService = CachingService.getInstance();
      await cachingService.findById({ id: cacheId });

      expect(mockGet).toHaveBeenCalledWith({
        path: '/api/caching/cache-123',
        options: {
          responseType: 'json',
          requestFormat: 'json',
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });

    it('should handle onSuccess callback', async () => {
      const cacheId = 'cache-123';
      const mockCacheInfo: CacheInfo = {
        name: 'test-cache',
        estimatedSize: 1024,
        requestCount: 100,
        hitCount: 80,
        hitRate: 0.8,
        missCount: 20,
        missRate: 0.2,
        expireAfterWrite: null,
        expireAfterAccess: null,
        maximumSize: 10000,
        currentSize: 5000,
        evictionCount: 0,
        evictionWeight: 0,
        loadCount: 0,
        totalLoadTime: 0,
        averageLoadPenalty: 0,
        loadSuccessCount: 0,
        loadFailureCount: 0,
        loadFailureRate: 0,
      };
      const mockResponse = {
        data: [mockCacheInfo],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockGet.mockImplementation(async (params: any) => {
        if (params.bshOptions?.onSuccess) {
          params.bshOptions.onSuccess(mockResponse);
          return undefined;
        }
        return mockResponse;
      });

      const onSuccess = vi.fn();
      const cachingService = CachingService.getInstance();
      await cachingService.findById({ id: cacheId, onSuccess });

      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('search', () => {
    it('should call client.post with correct endpoint and payload', async () => {
      const searchParams: BshSearch = {
        filters: [
          {
            field: 'name',
            operator: 'eq',
            value: 'test-cache',
          },
        ],
      };
      const mockCacheInfo: CacheInfo = {
        name: 'test-cache',
        estimatedSize: 1024,
        requestCount: 100,
        hitCount: 80,
        hitRate: 0.8,
        missCount: 20,
        missRate: 0.2,
        expireAfterWrite: 3600,
        expireAfterAccess: 1800,
        maximumSize: 10000,
        currentSize: 5000,
        evictionCount: 10,
        evictionWeight: 5,
        loadCount: 20,
        totalLoadTime: 1000,
        averageLoadPenalty: 50,
        loadSuccessCount: 18,
        loadFailureCount: 2,
        loadFailureRate: 0.1,
      };
      const mockResponse = {
        data: [mockCacheInfo],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPost.mockResolvedValue(mockResponse);

      const cachingService = CachingService.getInstance();
      await cachingService.search({ payload: searchParams });

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
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });
  });

  describe('names', () => {
    it('should call client.get with correct endpoint', async () => {
      const mockResponse = {
        data: ['cache-1', 'cache-2', 'cache-3'],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockGet.mockResolvedValue(mockResponse);

      const cachingService = CachingService.getInstance();
      await cachingService.names({});

      expect(mockGet).toHaveBeenCalledWith({
        path: '/api/caching/names',
        options: {
          responseType: 'json',
          requestFormat: 'json',
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });

    it('should handle onSuccess callback', async () => {
      const mockResponse = {
        data: ['cache-1', 'cache-2'],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockGet.mockImplementation(async (params: any) => {
        if (params.bshOptions?.onSuccess) {
          params.bshOptions.onSuccess(mockResponse);
          return undefined;
        }
        return mockResponse;
      });

      const onSuccess = vi.fn();
      const cachingService = CachingService.getInstance();
      await cachingService.names({ onSuccess });

      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('clearById', () => {
    it('should call client.delete with correct endpoint', async () => {
      const cacheId = 'cache-123';
      const mockResponse = {
        data: [{ effected: 1 }],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockDelete.mockResolvedValue(mockResponse);

      const cachingService = CachingService.getInstance();
      await cachingService.clearById({ id: cacheId });

      expect(mockDelete).toHaveBeenCalledWith({
        path: '/api/caching/cache-123',
        options: {
          responseType: 'json',
          requestFormat: 'json',
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });

    it('should handle onSuccess callback', async () => {
      const cacheId = 'cache-123';
      const mockResponse = {
        data: [{ effected: 1 }],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockDelete.mockImplementation(async (params: any) => {
        if (params.bshOptions?.onSuccess) {
          params.bshOptions.onSuccess(mockResponse);
          return undefined;
        }
        return mockResponse;
      });

      const onSuccess = vi.fn();
      const cachingService = CachingService.getInstance();
      await cachingService.clearById({ id: cacheId, onSuccess });

      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('clearAll', () => {
    it('should call client.delete with correct endpoint', async () => {
      const mockResponse = {
        data: [{ effected: 5 }],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockDelete.mockResolvedValue(mockResponse);

      const cachingService = CachingService.getInstance();
      await cachingService.clearAll({});

      expect(mockDelete).toHaveBeenCalledWith({
        path: '/api/caching/all',
        options: {
          responseType: 'json',
          requestFormat: 'json',
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });

    it('should handle onSuccess callback', async () => {
      const mockResponse = {
        data: [{ effected: 5 }],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockDelete.mockImplementation(async (params: any) => {
        if (params.bshOptions?.onSuccess) {
          params.bshOptions.onSuccess(mockResponse);
          return undefined;
        }
        return mockResponse;
      });

      const onSuccess = vi.fn();
      const cachingService = CachingService.getInstance();
      await cachingService.clearAll({ onSuccess });

      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle onError callback', async () => {
      const mockError = new BshError(500, '/api/caching/all');
      mockDelete.mockRejectedValue(mockError);

      const onError = vi.fn();
      const cachingService = CachingService.getInstance();
      await cachingService.clearAll({ onError }).catch(() => {});

      expect(mockDelete).toHaveBeenCalled();
    });
  });
});

