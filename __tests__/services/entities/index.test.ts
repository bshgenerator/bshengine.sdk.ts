import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EntityService } from '../../../src/services/entities';
import { BshClient } from '../../../src/client/bsh-client';
import { BshSearch } from '../../../src/types';

describe('EntityService', () => {
    let entityService: EntityService;
    let mockClient: BshClient;
    let mockGet: ReturnType<typeof vi.fn>;
    let mockPost: ReturnType<typeof vi.fn>;
    let mockPut: ReturnType<typeof vi.fn>;
    let mockDelete: ReturnType<typeof vi.fn>;
    let mockDownload: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockGet = vi.fn();
        mockPost = vi.fn();
        mockPut = vi.fn();
        mockDelete = vi.fn();
        mockDownload = vi.fn();
        mockClient = {
            get: mockGet,
            post: mockPost,
            put: mockPut,
            delete: mockDelete,
            patch: vi.fn(),
            download: mockDownload,
        } as unknown as BshClient;
        entityService = new EntityService(mockClient, 'TestEntity');
    });

    describe('findById', () => {
        it('should call client.get with entity from constructor', async () => {
            const mockResponse = {
                data: [{ id: '1', name: 'Test' }],
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

            const result = await entityService.findById(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/entities/TestEntity/1',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                entity: 'TestEntity',
                api: 'entities.TestEntity.findById',
            });
            expect(result).toEqual(mockResponse);
        });

        it('should use entity from params when provided', async () => {
            const mockResponse = {
                data: [{ id: '1' }],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockGet.mockResolvedValue(mockResponse);

            const params = {
                id: '1',
                entity: 'CustomEntity',
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            await entityService.findById(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/entities/CustomEntity/1',
                options: expect.any(Object),
                bshOptions: expect.any(Object),
                entity: 'CustomEntity',
                api: 'entities.CustomEntity.findById',
            });
        });
    });

    describe('create', () => {
        it('should call client.post with correct parameters', async () => {
            const mockResponse = {
                data: [{ id: '1', name: 'New Entity' }],
                code: 201,
                status: 'Created',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const payload = { name: 'New Entity' };
            const params = {
                payload,
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await entityService.create(params);

            expect(mockPost).toHaveBeenCalledWith({
                path: '/api/entities/TestEntity',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: payload,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                entity: 'TestEntity',
                api: 'entities.TestEntity.create',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('createMany', () => {
        it('should call client.post with batch endpoint', async () => {
            const mockResponse = {
                data: [{ id: '1' }, { id: '2' }],
                code: 201,
                status: 'Created',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const payload = [{ name: 'Entity1' }, { name: 'Entity2' }];
            const params = {
                payload,
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await entityService.createMany(params);

            expect(mockPost).toHaveBeenCalledWith({
                path: '/api/entities/TestEntity/batch',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: payload,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                entity: 'TestEntity',
                api: 'entities.TestEntity.createMany',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('update', () => {
        it('should call client.put with correct parameters', async () => {
            const mockResponse = {
                data: [{ id: '1', name: 'Updated Entity' }],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPut.mockResolvedValue(mockResponse);

            const payload = { id: '1', name: 'Updated Entity' };
            const params = {
                payload,
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await entityService.update(params);

            expect(mockPut).toHaveBeenCalledWith({
                path: '/api/entities/TestEntity',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: payload,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                entity: 'TestEntity',
                api: 'entities.TestEntity.update',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('updateMany', () => {
        it('should call client.put with batch endpoint', async () => {
            const mockResponse = {
                data: [{ id: '1' }, { id: '2' }],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPut.mockResolvedValue(mockResponse);

            const payload = [{ id: '1', name: 'Updated1' }, { id: '2', name: 'Updated2' }];
            const params = {
                payload,
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await entityService.updateMany(params);

            expect(mockPut).toHaveBeenCalledWith({
                path: '/api/entities/TestEntity/batch',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: payload,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                entity: 'TestEntity',
                api: 'entities.TestEntity.updateMany',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('search', () => {
        it('should call client.post with search endpoint', async () => {
            const mockResponse = {
                data: [{ id: '1' }],
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

            const result = await entityService.search(params);

            expect(mockPost).toHaveBeenCalledWith({
                path: '/api/entities/TestEntity/search',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: searchParams,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                entity: 'TestEntity',
                api: 'entities.TestEntity.search',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('delete', () => {
        it('should call client.post with delete endpoint', async () => {
            const mockResponse = {
                data: [{ effected: 5 }],
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

            const result = await entityService.delete(params);

            expect(mockPost).toHaveBeenCalledWith({
                path: '/api/entities/TestEntity/delete',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: searchParams,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                entity: 'TestEntity',
                api: 'entities.TestEntity.delete',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('deleteById', () => {
        it('should call client.delete with correct parameters', async () => {
            const mockResponse = {
                data: [{ effected: 1 }],
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

            const result = await entityService.deleteById(params);

            expect(mockDelete).toHaveBeenCalledWith({
                path: '/api/entities/TestEntity/1',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                entity: 'TestEntity',
                api: 'entities.TestEntity.deleteById',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('columns', () => {
        it('should call client.get with columns endpoint', async () => {
            const mockResponse = {
                data: [{ name: 'id', type: 'string' }, { name: 'name', type: 'string' }],
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

            const result = await entityService.columns(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/entities/TestEntity/columns',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                entity: 'TestEntity',
                api: 'entities.TestEntity.columns',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('count', () => {
        it('should call client.get with count endpoint', async () => {
            const mockResponse = {
                data: [{ count: 42 }],
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

            const result = await entityService.count(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/entities/TestEntity/count',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                entity: 'TestEntity',
                api: 'entities.TestEntity.count',
            });
            expect(result).toEqual(mockResponse);
        });

        it('should use entity from params when provided', async () => {
            const mockResponse = {
                data: [{ count: 10 }],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockGet.mockResolvedValue(mockResponse);

            const params = {
                entity: 'CustomEntity',
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            await entityService.count(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/entities/CustomEntity/count',
                options: expect.any(Object),
                bshOptions: expect.any(Object),
                entity: 'CustomEntity',
                api: 'entities.CustomEntity.count',
            });
        });
    });

    describe('countFiltered', () => {
        it('should call client.post with count endpoint and search payload', async () => {
            const mockResponse = {
                data: [{ count: 15 }],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const searchParams: BshSearch = {
                filters: [{ field: 'name', operator: 'eq', value: 'Test' }],
                sort: [{ field: 'id', direction: 1 }],
                pagination: { page: 1, size: 10 }
            };
            const params = {
                payload: searchParams,
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await entityService.countFiltered(params);

            expect(mockPost).toHaveBeenCalledWith({
                path: '/api/entities/TestEntity/count',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: searchParams,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                entity: 'TestEntity',
                api: 'entities.TestEntity.countBySearch',
            });
            expect(result).toEqual(mockResponse);
        });

        it('should use entity from params when provided', async () => {
            const mockResponse = {
                data: [{ count: 8 }],
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
                entity: 'CustomEntity',
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            await entityService.countFiltered(params);

            expect(mockPost).toHaveBeenCalledWith({
                path: '/api/entities/CustomEntity/count',
                options: expect.any(Object),
                bshOptions: expect.any(Object),
                entity: 'CustomEntity',
                api: 'entities.CustomEntity.countBySearch',
            });
        });
    });

    describe('export', () => {
        it('should call client.download with export endpoint', async () => {
            const blob = new Blob(['test'], { type: 'application/json' });
            mockDownload.mockResolvedValue(blob);

            const searchParams: BshSearch = {
                filters: [],
                sort: [],
                pagination: { page: 1, size: 10 }
            };
            const params = {
                payload: searchParams,
                format: 'csv' as const,
                onDownload: vi.fn(),
                onError: vi.fn()
            };

            await entityService.export(params);

            expect(mockDownload).toHaveBeenCalled();
            const callArgs = mockDownload.mock.calls[0][0];
            expect(callArgs.path).toContain('/api/entities/TestEntity/export');
            expect(callArgs.path).toContain('format=csv');
            expect(callArgs.path).toContain('filename=');
        });

        it('should use custom filename when provided', async () => {
            const blob = new Blob(['test'], { type: 'application/json' });
            mockDownload.mockResolvedValue(blob);

            const searchParams: BshSearch = {
                filters: [],
                sort: [],
                pagination: { page: 1, size: 10 }
            };
            const params = {
                payload: searchParams,
                format: 'json' as const,
                filename: 'custom-export.json',
                onDownload: vi.fn(),
                onError: vi.fn()
            };

            await entityService.export(params);

            const callArgs = mockDownload.mock.calls[0][0];
            expect(callArgs.path).toContain('filename=custom-export.json');
        });
    });
});

