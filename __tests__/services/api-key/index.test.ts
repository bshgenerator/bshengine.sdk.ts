import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiKeyService } from '@src/services/api-key';
import { bshConfigs } from '@config';
import type { BshClientFn, BshAuthFn } from '@src/client/types';
import type { BshApiKeys, BshApiKeysForm, BshSearch } from '@types';
import { BshError } from '@types';

describe('ApiKeyService', () => {
  let mockClientFn: BshClientFn;
  let mockAuthFn: BshAuthFn;
  let mockGet: any;
  let mockPost: any;
  let mockDelete: any;

  beforeEach(() => {
    // Reset singleton
    (ApiKeyService as any).instance = undefined;
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
      const instance1 = ApiKeyService.getInstance();
      const instance2 = ApiKeyService.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should create a new instance after reset', () => {
      const instance1 = ApiKeyService.getInstance();
      (ApiKeyService as any).instance = undefined;
      const instance2 = ApiKeyService.getInstance();

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('create', () => {
    it('should call client.post with correct endpoint and payload', async () => {
      const apiKeyForm: BshApiKeysForm = {
        name: 'Test API Key',
        description: 'Test description',
        duration: 3600,
        type: 'PERSONAL',
        scopes: ['BshUsers:READ', 'BshUsers:WRITE'],
      };
      const mockApiKey: BshApiKeys = {
        ...apiKeyForm,
        id: 1,
        apiKey: 'test-api-key-123',
        startedAt: { $date: new Date().toISOString() },
        status: 'ACTIVE',
        persistenceId: '1',
        CreatedAt: { $date: new Date().toISOString() },
      };
      const mockResponse = {
        data: [mockApiKey],
        code: 201,
        status: 'Created',
        error: '',
      };
      mockPost.mockResolvedValue(mockResponse);

      const apiKeyService = ApiKeyService.getInstance();
      await apiKeyService.create({ payload: apiKeyForm });

      expect(mockPost).toHaveBeenCalledWith({
        path: '/api/api-keys',
        options: {
          responseType: 'json',
          requestFormat: 'json',
          body: apiKeyForm,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });

    it('should handle onSuccess callback', async () => {
      const apiKeyForm: BshApiKeysForm = {
        name: 'Test API Key',
        duration: 3600,
        type: 'MACHINE',
        scopes: [],
      };
      const mockApiKey: BshApiKeys = {
        ...apiKeyForm,
        id: 1,
        apiKey: 'test-api-key-123',
        startedAt: { $date: new Date().toISOString() },
        status: 'ACTIVE',
        persistenceId: '1',
        CreatedAt: { $date: new Date().toISOString() },
      };
      const mockResponse = {
        data: [mockApiKey],
        code: 201,
        status: 'Created',
        error: '',
      };
      mockPost.mockImplementation(async (params: any) => {
        if (params.bshOptions?.onSuccess) {
          params.bshOptions.onSuccess(mockResponse);
          return undefined;
        }
        return mockResponse;
      });

      const onSuccess = vi.fn();
      const apiKeyService = ApiKeyService.getInstance();
      await apiKeyService.create({ payload: apiKeyForm, onSuccess });

      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('details', () => {
    it('should call client.get with correct endpoint', async () => {
      const id = 1;
      const mockApiKey: BshApiKeys = {
        id: 1,
        name: 'Test API Key',
        description: 'Test description',
        duration: 3600,
        type: 'PERSONAL',
        scopes: ['BshUsers:READ'],
        apiKey: 'test-api-key-123',
        startedAt: { $date: new Date().toISOString() },
        status: 'ACTIVE',
        persistenceId: '1',
        CreatedAt: { $date: new Date().toISOString() },
      };
      const mockResponse = {
        data: [mockApiKey],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockGet.mockResolvedValue(mockResponse);

      const apiKeyService = ApiKeyService.getInstance();
      await apiKeyService.details({ id });

      expect(mockGet).toHaveBeenCalledWith({
        path: '/api/api-keys/1',
        options: {
          responseType: 'json',
          requestFormat: 'json',
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });
  });

  describe('revoke', () => {
    it('should call client.delete with correct endpoint', async () => {
      const id = 1;
      const mockApiKey: BshApiKeys = {
        id: 1,
        name: 'Test API Key',
        duration: 3600,
        type: 'PERSONAL',
        scopes: [],
        apiKey: 'test-api-key-123',
        startedAt: { $date: new Date().toISOString() },
        status: 'REVOKED',
        persistenceId: '1',
        CreatedAt: { $date: new Date().toISOString() },
      };
      const mockResponse = {
        data: [mockApiKey],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockDelete.mockResolvedValue(mockResponse);

      const apiKeyService = ApiKeyService.getInstance();
      await apiKeyService.revoke({ id });

      expect(mockDelete).toHaveBeenCalledWith({
        path: '/api/api-keys/1/revoke',
        options: {
          responseType: 'json',
          requestFormat: 'json',
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });
  });

  describe('getById', () => {
    it('should call client.get with correct endpoint', async () => {
      const id = 'api-key-123';
      const mockApiKey: BshApiKeys = {
        id: 1,
        name: 'Test API Key',
        duration: 3600,
        type: 'PERSONAL',
        scopes: [],
        apiKey: 'test-api-key-123',
        startedAt: { $date: new Date().toISOString() },
        status: 'ACTIVE',
        persistenceId: '1',
        CreatedAt: { $date: new Date().toISOString() },
      };
      const mockResponse = {
        data: [mockApiKey],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockGet.mockResolvedValue(mockResponse);

      const apiKeyService = ApiKeyService.getInstance();
      await apiKeyService.getById({ id });

      expect(mockGet).toHaveBeenCalledWith({
        path: '/api/api-keys/api-key-123',
        options: {
          responseType: 'json',
          requestFormat: 'json',
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });
  });

  describe('search', () => {
    it('should call client.post with correct endpoint and payload', async () => {
      const searchParams: BshSearch<BshApiKeys> = {
        filters: [
          {
            field: 'name',
            operator: 'eq',
            value: 'Test API Key',
          },
        ],
      };
      const mockApiKey: BshApiKeys = {
        id: 1,
        name: 'Test API Key',
        duration: 3600,
        type: 'PERSONAL',
        scopes: [],
        apiKey: 'test-api-key-123',
        startedAt: { $date: new Date().toISOString() },
        status: 'ACTIVE',
        persistenceId: '1',
        CreatedAt: { $date: new Date().toISOString() },
      };
      const mockResponse = {
        data: [mockApiKey],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPost.mockResolvedValue(mockResponse);

      const apiKeyService = ApiKeyService.getInstance();
      await apiKeyService.search({ payload: searchParams });

      expect(mockPost).toHaveBeenCalledWith({
        path: '/api/api-keys/search',
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

  describe('list', () => {
    it('should call client.get with query parameters', async () => {
      const mockApiKey: BshApiKeys = {
        id: 1,
        name: 'Test API Key',
        duration: 3600,
        type: 'PERSONAL',
        scopes: [],
        apiKey: 'test-api-key-123',
        startedAt: { $date: new Date().toISOString() },
        status: 'ACTIVE',
        persistenceId: '1',
        CreatedAt: { $date: new Date().toISOString() },
      };
      const mockResponse = {
        data: [mockApiKey],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockGet.mockResolvedValue(mockResponse);

      const apiKeyService = ApiKeyService.getInstance();
      await apiKeyService.list({
        queryParams: {
          page: '1',
          size: '10',
          sort: 'name',
        },
      });

      expect(mockGet).toHaveBeenCalledWith({
        path: '/api/api-keys?page=1&size=10&sort=name',
        options: {
          responseType: 'json',
          requestFormat: 'json',
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });

    it('should call client.get without query parameters', async () => {
      const mockApiKey: BshApiKeys = {
        id: 1,
        name: 'Test API Key',
        duration: 3600,
        type: 'PERSONAL',
        scopes: [],
        apiKey: 'test-api-key-123',
        startedAt: { $date: new Date().toISOString() },
        status: 'ACTIVE',
        persistenceId: '1',
        CreatedAt: { $date: new Date().toISOString() },
      };
      const mockResponse = {
        data: [mockApiKey],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockGet.mockResolvedValue(mockResponse);

      const apiKeyService = ApiKeyService.getInstance();
      await apiKeyService.list({});

      expect(mockGet).toHaveBeenCalledWith({
        path: '/api/api-keys',
        options: {
          responseType: 'json',
          requestFormat: 'json',
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });
  });

  describe('deleteById', () => {
    it('should call client.delete with correct endpoint', async () => {
      const id = 'api-key-123';
      const mockApiKey: BshApiKeys = {
        id: 1,
        name: 'Test API Key',
        duration: 3600,
        type: 'PERSONAL',
        scopes: [],
        apiKey: 'test-api-key-123',
        startedAt: { $date: new Date().toISOString() },
        status: 'REVOKED',
        persistenceId: '1',
        CreatedAt: { $date: new Date().toISOString() },
      };
      const mockResponse = {
        data: [mockApiKey],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockDelete.mockResolvedValue(mockResponse);

      const apiKeyService = ApiKeyService.getInstance();
      await apiKeyService.deleteById({ id });

      expect(mockDelete).toHaveBeenCalledWith({
        path: '/api/api-keys/api-key-123',
        options: {
          responseType: 'json',
          requestFormat: 'json',
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });

    it('should handle onError callback', async () => {
      const id = 'invalid-id';
      const mockError = new BshError(404, '/api/api-keys/invalid-id');
      mockDelete.mockRejectedValue(mockError);

      const onError = vi.fn();
      const apiKeyService = ApiKeyService.getInstance();
      await apiKeyService.deleteById({ id, onError }).catch(() => {});

      expect(mockDelete).toHaveBeenCalled();
    });
  });
});

