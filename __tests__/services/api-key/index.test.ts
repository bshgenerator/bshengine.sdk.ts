import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiKeyService } from '../../../src/services/api-key';
import { BshClient } from '../../../src/client/bsh-client';
import { BshApiKeys, BshApiKeysForm, BshSearch } from '../../../src/types';

describe('ApiKeyService', () => {
    let apiKeyService: ApiKeyService;
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
        apiKeyService = new ApiKeyService(mockClient);
    });

    describe('create', () => {
        it('should call client.post with correct parameters', async () => {
            const mockApiKey: BshApiKeys = {
                id: 1,
                name: 'Test Key',
                description: 'Test description',
                duration: 3600,
                type: 'PERSONAL',
                scopes: [],
                apiKey: 'bsh_1234567890',
                startedAt: { $date: new Date().toISOString() },
                status: 'ACTIVE',
                persistenceId: '1'
            };
            const mockResponse = {
                data: [mockApiKey],
                code: 201,
                status: 'Created',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const payload: BshApiKeysForm = {
                name: 'Test Key',
                description: 'Test description',
                duration: 3600,
                type: 'PERSONAL',
                scopes: []
            };
            const params = {
                payload,
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await apiKeyService.create(params);

            expect(mockPost).toHaveBeenCalledWith({
                path: '/api/api-keys',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: payload,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'api-key.create',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('details', () => {
        it('should call client.get with correct parameters', async () => {
            const mockApiKey: BshApiKeys = {
                id: 1,
                name: 'Test Key',
                description: 'Test description',
                duration: 3600,
                type: 'PERSONAL',
                scopes: [],
                apiKey: 'bsh_1234567890',
                startedAt: { $date: new Date().toISOString() },
                status: 'ACTIVE',
                persistenceId: '1'
            };
            const mockResponse = {
                data: [mockApiKey],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockGet.mockResolvedValue(mockResponse);

            const params = {
                id: 1,
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await apiKeyService.details(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/api-keys/1',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('revoke', () => {
        it('should call client.delete with correct parameters', async () => {
            const mockApiKey: BshApiKeys = {
                id: 1,
                name: 'Test Key',
                description: 'Test description',
                duration: 3600,
                type: 'PERSONAL',
                scopes: [],
                apiKey: 'bsh_1234567890',
                startedAt: { $date: new Date().toISOString() },
                status: 'ACTIVE',
                persistenceId: '1'
            };
            const mockResponse = {
                data: [mockApiKey],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockDelete.mockResolvedValue(mockResponse);

            const params = {
                id: 1,
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await apiKeyService.revoke(params);

            expect(mockDelete).toHaveBeenCalledWith({
                path: '/api/api-keys/1/revoke',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'api-key.revoke',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('getById', () => {
        it('should call client.get with correct parameters', async () => {
            const mockApiKey: BshApiKeys = {
                id: 1,
                name: 'Test Key',
                description: 'Test description',
                duration: 3600,
                type: 'PERSONAL',
                scopes: [],
                apiKey: 'bsh_1234567890',
                startedAt: { $date: new Date().toISOString() },
                status: 'ACTIVE',
                persistenceId: '1'
            };
            const mockResponse = {
                data: [mockApiKey],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockGet.mockResolvedValue(mockResponse);

            const params = {
                id: '1',
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await apiKeyService.getById(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/api-keys/1',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'api-key.getById',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('search', () => {
        it('should call client.post with correct parameters', async () => {
            const mockApiKey: BshApiKeys = {
                id: 1,
                name: 'Test Key',
                description: 'Test description',
                duration: 3600,
                type: 'PERSONAL',
                scopes: [],
                apiKey: 'bsh_1234567890',
                startedAt: { $date: new Date().toISOString() },
                status: 'ACTIVE',
                persistenceId: '1'
            };
            const mockResponse = {
                data: [mockApiKey],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const searchParams: BshSearch<BshApiKeys> = {
                filters: [],
                sort: [],
                pagination: { page: 1, size: 10 }
            };
            const params = {
                payload: searchParams,
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await apiKeyService.search(params);

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
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'api-key.search',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('list', () => {
        it('should call client.get with correct parameters and no query params', async () => {
            const mockApiKey: BshApiKeys = {
                id: 1,
                name: 'Test Key',
                description: 'Test description',
                duration: 3600,
                type: 'PERSONAL',
                scopes: [],
                apiKey: 'bsh_1234567890',
                startedAt: { $date: new Date().toISOString() },
                status: 'ACTIVE',
                persistenceId: '1'
            };
            const mockResponse = {
                data: [mockApiKey],
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

            const result = await apiKeyService.list(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/api-keys',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'api-key.list',
            });
            expect(result).toEqual(mockResponse);
        });

        it('should call client.get with query params', async () => {
            const mockApiKey: BshApiKeys = {
                id: 1,
                name: 'Test Key',
                description: 'Test description',
                duration: 3600,
                type: 'PERSONAL',
                scopes: [],
                apiKey: 'bsh_1234567890',
                startedAt: { $date: new Date().toISOString() },
                status: 'ACTIVE',
                persistenceId: '1'
            };
            const mockResponse = {
                data: [mockApiKey],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockGet.mockResolvedValue(mockResponse);

            const params = {
                queryParams: {
                    page: '1',
                    size: '10',
                    sort: 'name',
                    filter: 'active'
                },
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await apiKeyService.list(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/api-keys?page=1&size=10&sort=name&filter=active',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'api-key.list',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('deleteById', () => {
        it('should call client.delete with correct parameters', async () => {
            const mockApiKey: BshApiKeys = {
                id: 1,
                name: 'Test Key',
                description: 'Test description',
                duration: 3600,
                type: 'PERSONAL',
                scopes: [],
                apiKey: 'bsh_1234567890',
                startedAt: { $date: new Date().toISOString() },
                status: 'ACTIVE',
                persistenceId: '1'
            };
            const mockResponse = {
                data: [mockApiKey],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockDelete.mockResolvedValue(mockResponse);

            const params = {
                id: '1',
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await apiKeyService.deleteById(params);

            expect(mockDelete).toHaveBeenCalledWith({
                path: '/api/api-keys/1',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'api-key.deleteById',
            });
            expect(result).toEqual(mockResponse);
        });
    });
});

