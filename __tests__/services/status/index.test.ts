import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatusService } from '../../../src/services/status';
import { BshClient } from '../../../src/client/bsh-client';
import { EngineStatus, HealthCheckData } from '../../../src/types';

describe('StatusService', () => {
    let statusService: StatusService;
    let mockClient: BshClient;
    let mockGet: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockGet = vi.fn();
        mockClient = {
            get: mockGet,
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
            patch: vi.fn(),
            download: vi.fn(),
        } as unknown as BshClient;
        statusService = new StatusService(mockClient);
    });

    describe('load', () => {
        it('should call client.get with correct parameters', async () => {
            const mockEngineStatus: EngineStatus = {
                status: 'HEALTHY',
                version: '1.0.0',
                environment: 'development',
                timestamp: {
                    $date: '2024-01-01T00:00:00Z'
                },
                services: []
            };
            const mockResponse = {
                data: [mockEngineStatus],
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

            const result = await statusService.load(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/status',
                options: {
                    responseType: 'json',
                    requestFormat: 'json'
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'status.load',
            });
            expect(result).toEqual(mockResponse);
        });

        it('should call client.get without callbacks when no params provided', async () => {
            const mockEngineStatus: EngineStatus = {
                status: 'HEALTHY',
                version: '1.0.0',
                environment: 'production',
                timestamp: {
                    $date: '2024-01-01T00:00:00Z'
                },
                services: []
            };
            const mockResponse = {
                data: [mockEngineStatus],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockGet.mockResolvedValue(mockResponse);

            const result = await statusService.load();

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/status',
                options: {
                    responseType: 'json',
                    requestFormat: 'json'
                },
                bshOptions: { onSuccess: undefined, onError: undefined },
                api: 'status.load',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('health', () => {
        it('should call client.get with correct parameters', async () => {
            const mockHealthCheck: HealthCheckData = {
                status: 'HEALTHY',
                version: '1.0.0',
                timestamp: {
                    $date: '2024-01-01T00:00:00Z'
                },
            };
            const mockResponse = {
                data: [mockHealthCheck],
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

            const result = await statusService.health(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/status/health',
                options: {
                    responseType: 'json',
                    requestFormat: 'json'
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'status.health',
            });
            expect(result).toEqual(mockResponse);
        });

        it('should call client.get without callbacks when no params provided', async () => {
            const mockHealthCheck: HealthCheckData = {
                status: 'DEGRADED',
                version: '1.0.0',
                timestamp: {
                    $date: '2024-01-01T00:00:00Z'
                },
            };
            const mockResponse = {
                data: [mockHealthCheck],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockGet.mockResolvedValue(mockResponse);

            const result = await statusService.health();

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/status/health',
                options: {
                    responseType: 'json',
                    requestFormat: 'json'
                },
                bshOptions: { onSuccess: undefined, onError: undefined },
                api: 'status.health',
            });
            expect(result).toEqual(mockResponse);
        });
    });
});
